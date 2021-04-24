'use strict';

const stripe = require('stripe')(process.env.STRIPE_KEY)
const { sanitizeEntity } = require("strapi-utils")

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
        amount: total * 100,
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
    
    //salvar no banco
    const entry = {
      total_in_cents,
      payment_intent_id: paymentIntentId,
      card_brand:null,
      card_last4: null,
      user: userInfo,
      games
    }

    const entity = await strapi.services.order.create(entry)

    //enviar um email da compra para o usuário

    //retornando o  que foi salvo no banco
    return sanitizeEntity(entity, { model: strapi.models.order })

  }
};
