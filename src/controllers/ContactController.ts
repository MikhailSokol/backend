import { Context } from "koa";
import { Contact, TParams } from "../models/Contact";

// Получение списка контактов с количеством вызовов

// Получение определенного контакта со списком всех его вызовов

// Создание нового контакта

// Редактирование отдельного контакта

class ContactController {
  async index(ctx: Context) {
    let data = await new Contact().index();

    ctx.body = data;
  }

  async show(ctx: Context) {
    const params: Record<keyof TParams, string> = ctx.params;

    const checkCid = !Number.isNaN(+params.id);

    if (!checkCid) {
      ctx.body = { error: "bad cid" };

      return;
    }

    let data = await new Contact(Number(params.id)).show();

    ctx.body = data;
  }

  async create(ctx: Context) {
    const body: TParams = ctx.request.body;

    const emptyParams = !body.name || !body.post || !body.surname;

    if (emptyParams) {
      ctx.body = { error: "empty params" };

      return;
    }

    let data = await new Contact(
      undefined,
      body.name,
      body.surname,
      body.post
    ).create();

    ctx.body = data;
  }

  async update(ctx: Context) {
    const body: TParams = ctx.request.body;

    const emptyParams = !body?.name && !body?.post && !body?.surname;

    if (emptyParams) {
      ctx.body = { error: "empty params" };

      return;
    }

    const params: Record<keyof TParams, string> = ctx.params;

    const checkCid = !Number.isNaN(+params.id);

    if (!checkCid) {
      ctx.body = { error: "bad cid" };

      return;
    }

    let data = await new Contact(
      +params.id,
      body?.name,
      body?.surname,
      body?.post
    ).update();

    ctx.body = data;
  }

  async delete(ctx: Context) {
    const params: Record<keyof TParams, string> = ctx.params;

    const checkCid = !Number.isNaN(+params.id);

    if (!checkCid) {
      ctx.body = { error: "bad cid" };

      return;
    }

    let data = await new Contact(Number(params.id)).delete();

    ctx.body = data;
  }
}

export default new ContactController();
