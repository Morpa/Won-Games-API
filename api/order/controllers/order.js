'use strict';

const stripe = require('stripe')(process.env.STRIPE_KEY)
const { sanitizeEntity } = require("strapi-utils")
const orderTemplate = require("../../../config/email-templates/order");

module.exports = {
  createPaymentIntent: async (ctx) => {
    const { cart } = ctx.request.body;

    //simplify cart data
    const cartGamesId = await strapi.config.functions.cart.cartGamesId(cart)

  //get all games
    const games = await strapi.config.functions.cart.cartItems(cartGamesId)

    if (!games.length) {
      ctx.response.status = 404;
      return {
        error: "No valid games found!"
      };
    }

    const total = await strapi.config.functions.cart.total(games)

    if (total === 0) {
      return {
        freeGames: true,
      }
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "eur",
        metadata: { cart: JSON.stringify(cartGamesId) },
      });

      return paymentIntent;
    } catch (err) {
      return {
        error: err.raw.message,
      };
    }
  },

  create: async (ctx) => {
    //pegar as informações do frontend
    const { cart, paymentIntentId, paymentMethod } = ctx.request.body;

    //pega o token
    const token = await strapi.plugins["users-permissions"]
      .services.jwt.getToken(ctx)
    
    //pega o id do usuário
    const userId = token.id

    //pegar as informações do usuário
    const userInfo = await strapi
      .query("user", "users-permissions")
      .findOne({ id: userId })
    
        //simplify cart data
        const cartGamesId = await strapi.config.functions.cart.cartGamesId(cart)

    
    //pegar os jogos
    const games = await strapi.config.functions.cart.cartItems(cartGamesId)

    //pegar o total (saber se é free ou não)
    const total_in_cents = await strapi.config.functions.cart.total(games)

    let paymentInfo;
    if (total_in_cents !== 0) {
      try {
        paymentInfo = await stripe.paymentMethods.retrieve(paymentMethod);
      } catch (err) {
        ctx.response.status = 402;
        return { error: err.message };
      }
    }
    
    //salvar no banco
    const entry = {
      total_in_cents,
      payment_intent_id: paymentIntentId,
      card_brand: paymentInfo?.card?.brand,
      card_last4: paymentInfo?.card?.last4,
      user: userInfo,
      games
    }

    const entity = await strapi.services.order.create(entry)

    //enviar um email da compra para o usuário
    await strapi.plugins.email.services.email.sendTemplatedEmail(
      {
        to: userInfo.email,
        from: "no-reply@wongames.com",
      },
      orderTemplate,
      {
        user: userInfo,
        payment: {
          total: `$ ${total_in_cents / 100}`,
          card_brand: entry.card_brand,
          card_last4: entry.card_last4,
        },
        games,
      }
    );

    //retornando o  que foi salvo no banco
    return sanitizeEntity(entity, { model: strapi.models.order })

  }
};
