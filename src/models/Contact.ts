import { Pool } from "pg";

export class Contact {
  cid: number | undefined;
  name: string | undefined;
  surname: string | undefined;
  post: string | undefined;
  static pool: Pool;
  constructor(
    cid?: number | undefined,
    name?: string | undefined,
    surname?: string | undefined,
    post?: string | undefined
  ) {
    this.cid = cid;
    this.name = name;
    this.surname = surname;
    this.post = post;
  }
 
  
  async index() {
    try {
      const res = await Contact.pool.query(
        `
      SELECT 
          contacts.cid , contacts.name , contacts.surname , contacts.post ,
          COUNT( CASE WHEN calls.src = contacts.cid THEN 1 END) AS incoming_calls_count,
          COUNT( CASE WHEN calls.trg = contacts.cid THEN 1 END) AS outgoing_calls_count
      FROM contacts
      LEFT JOIN calls  
          ON contacts.cid = calls.src OR contacts.cid = calls.trg
      GROUP BY contacts.cid
      ORDER BY contacts.cid
      ;`
      );

      return res.rows;
    } catch (err) {
      console.error("Ошибка выполнения запроса:", err);
    } finally {
      await Contact.pool.end(); // Закрываем соединение
    }
  }

  async show() {
    try {
      const query = `
               SELECT 
    contacts.cid,
    contacts.name,
    contacts.surname,
    contacts.post,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'duration', calls.duration,
                'status', calls.status,
                'type', 
                    CASE 
                        WHEN calls.src = contacts.cid THEN 'incoming'
                        WHEN calls.trg = contacts.cid THEN 'outgoing'
                    END,
                'partyName', 
                    CASE 
                        WHEN calls.src = contacts.cid THEN other_contact.name || ' ' || other_contact.surname
                        WHEN calls.trg = contacts.cid THEN other_contact.name || ' ' || other_contact.surname
                    END
            )
        ) FILTER (WHERE calls.id IS NOT NULL), 
        '[]'
    ) AS calls
FROM contacts
LEFT JOIN calls ON contacts.cid = calls.src OR contacts.cid = calls.trg
LEFT JOIN contacts AS other_contact 
    ON (calls.src = other_contact.cid AND calls.trg = contacts.cid) 
    OR (calls.trg = other_contact.cid AND calls.src = contacts.cid)
WHERE contacts.cid = $1
GROUP BY contacts.cid;
    `;

      const values = [this.cid];

      const result = await Contact.pool.query(query, values);

      if (result.rowCount === 0) {
        return { error: "Контакт с таким cid не найден." };
      }

      return result.rows[0];
    } catch (err) {
      console.error("Ошибка выполнения запроса:", err);
    } finally {
      await Contact.pool.end(); // Закрываем соединение
    }
  }

  async create() {
    try {
      const query = `
        INSERT INTO contacts (name, surname, post)
        VALUES ($1, $2, $3)
        RETURNING *;
       `;

      const values = [this.name, this.surname, this.post];

      const result = await Contact.pool.query(query, values);

      return result.rows;
    } catch (err) {
      console.error("Ошибка выполнения запроса:", err);
    } finally {
      await Contact.pool.end(); // Закрываем соединение
    }
  }

  async update() {
    try {
      const checkQuery = "SELECT 1 FROM contacts WHERE cid = $1 LIMIT 1";

      const checkResult = await Contact.pool.query(checkQuery, [this.cid]);

      if (checkResult.rowCount === 0) {
        return { error: "Контакт с таким cid не найден." };
      }

      const query = `
       UPDATE contacts
       SET
          name = COALESCE(NULLIF($1, ''), name),
          surname = COALESCE(NULLIF($2, ''), surname),
          post = COALESCE(NULLIF($3, ''), post)
       WHERE cid = $4
       RETURNING *;`;

      const values = [this.name, this.surname, this.post, this.cid];

      const result = await Contact.pool.query(query, values);

      return result.rows;
    } catch (err) {
      console.error("Ошибка выполнения запроса:", err);
    } finally {
      await Contact.pool.end(); // Закрываем соединение
    }
  }

  async delete() {
    try {
      const checkQuery = "SELECT 1 FROM contacts WHERE cid = $1 LIMIT 1";

      const checkResult = await Contact.pool.query(checkQuery, [this.cid]);

      if (checkResult.rowCount === 0) {
        return { error: "Контакт с таким cid не найден." };
      }

      const query = "DELETE FROM contacts WHERE cid = $1";

      const values = [this.cid];

      await Contact.pool.query(query, values);

      return { message: "контакт удалён" };
    } catch (err) {
      console.error("Ошибка выполнения запроса:", err);
    } finally {
      await Contact.pool.end(); // Закрываем соединение
    }
  }
}

export type TParams = {
  id: string | undefined;
  name: string | undefined;
  surname: string | undefined;
  post: string | undefined;
};
