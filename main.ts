import {Hono} from '@hono/hono';
import { streamText} from '@hono/hono/streaming'
const app = new Hono();


app.use(async (c, next) => {
  console.log(`[${c.req.method}], ${c.req.url}`)
  await next()
})

app.get('/', (ctx)=>{
  return streamText(ctx, async(stream)=>{
    const localData = {...localStorage};
    for(const car in localData){
      await stream.writeln(car  + crypto.randomUUID() )
      await stream.sleep(1000)  
    }
  })
})

interface Car{
  id: string,
  type: string,
  model: string,
};

const Nissan: Car = {
  id: '1',
  type: 'supercar',
  model: '2005'
};

const setItem = (key: string, value:Car) =>{
  localStorage.setItem(key, JSON.stringify(value));
}

const getItem = (key: string):Car | null =>{
  const item = localStorage.getItem(key);
  return item? JSON.parse(item) : null;
}

const deleteItem = (key: string)=>{
  localStorage.removeItem(key);
}

setItem(`car_${Nissan.id}`, Nissan);
const newCar = getItem(`car_${Nissan.id}`);

console.log(newCar);


app.post('/cars', async(ctx)=>{
  const carDetails = await ctx.req.json();
  const kotse: Car = carDetails;
  setItem(`car_${kotse.id}`, kotse);
  return ctx.json(`We just added ${kotse.id}`, 200);
})


app.get('/cars/:id', async(ctx)=>{
  const id = await ctx.req.param('id');
  const car = getItem(`car_${id}`);
  if(!car){
    return ctx.json({message: 'no data found'}, 404);
  }

  return ctx.json(car);
})

app.put('/cars/:id', async(ctx)=>{
  const id = await ctx.req.param('id');
  const {type, model} = await ctx.req.json();
  const newCar: Car = {id, type, model};
  setItem(`car_${newCar.id}`, newCar);

  return ctx.json({
    message: `car_${newCar.id} has been changed`
  })
})

app.delete('/cars/:id', async(ctx)=>{
  const id = await ctx.req.param('id');
  if(!getItem(`car_${id}`)){
    return ctx.json({
      message: 'item not found'
    }, 404)
  }
  deleteItem(`car_${id}`);
  return ctx.json({
    message: 'deleted successfuly'
  })

})

Deno.serve(app.fetch);