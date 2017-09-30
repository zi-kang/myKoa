/**
 * Created by huzikang on 17/9/30.
 */
console.log( 'hello world' );
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next)=>{
   if( ctx.request.path === '/' ) {
       ctx.response.type = 'text/html';
       ctx.response.body = '<a href="/">index page</a> ' + '<a href="/home">Home page</a> ' + '<a href="/404">404 Not Found</a> ';
   }else{
       await next();
   }
});


app.use(async (ctx,next)=>{
    if( ctx.request.path === '/home' ) {
        ctx.response.type = 'text/html';
        ctx.response.body = '<a href="/">index page</a> ' + '<a href="/home">Home page</a> ' + '<a href="/404">404 Not Found</a> '
    }else{
        await next();
    }
});
app.use(async (ctx,next)=>{
    if( ctx.request.path === '/404' ) {
        ctx.response.type = 'text/html';
        ctx.response.body = '<a href="/">index page</a> ' + '<a href="/home">Home page</a> ' + '<a href="/404">404 Not Found</a> '
    }else{
        await next();
    }
});


app.listen(3000,()=>{

    console.log( 'server is running at http://localhost:3000' );
});