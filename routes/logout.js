var session=require('../libs/mongoose');
exports.post = async function(ctx, next) {
  ctx.logout();
  var ses=ctx.sessionId;
  await session.models.Session.remove({sid:`koa:sess:${ses}`});
  ctx.session = null; // destroy session (!!!)

  if(ctx.request.ctx.params.f==':main')
    ctx.redirect('/');
  else
      ctx.redirect('/corzina');
};
