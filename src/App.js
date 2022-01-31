import './App.css'

import Dexie from 'dexie'
import {useLiveQuery} from 'dexie-react-hooks';

const App = () => {

  const db = new Dexie("MarketList");

  db.version(1).stores(
    {items: "++id,name,price,itemHasBeenPurchased"}
  )

  const addItemToDb = async event => {
    event.preventDefault()
    const name = document.querySelector('.item-name').value
    const price = document.querySelector('.item-price').value
    await db.items.add({
      name,
      price:Number(price),
      itemHasBeenPurchased:false
    })
  }
  
  const removeItemFromDb = async id => {
    await db.items.delete(id)
  }
  
  const markAsPurchased = async (id,event) => {
    if (event.target.checked){
      await db.items.update(id,{itemHasBeenPurchased:true})
    }
    else{
      await db.items.update(id,{itemHasBeenPurchased:false})
    }
  }

  const allItems = useLiveQuery(()=>db.items.toArray(),[]);
  if (!allItems) return null

  const itemData = allItems.map(({id,name,price,itemHasBeenPurchased})=>(
    <div className='row' key={id}>
      <p className='col s5'>
        <label>
          <input type="checkbox" checked={itemHasBeenPurchased} onChange={event => markAsPurchased(id,event)}></input>
          <span className='black-text'>{name}</span>
        </label>
      </p>
      <p className='col s5'>${price}</p>
      <i onClick={() => removeItemFromDb(id)} className='col s2 material-icons delete-button'></i>
    </div>
  ))
  

  return (
    <div className="container">
      <h3 className="green-text center-align">Market List App</h3>
      <form className="add-item-form" onSubmit={event => addItemToDb(event)}>
        <input className='item-name' type="text" placeholder="Name of item" required />
        <input className='item-price' type="number" placeholder="Price in USD" required />
        <button type="submit" className="waves-effect waves-light btn right">Add item</button>
      </form>
      {allItems.length > 0 &&
      <div className="card white darken-1">
        <div className="card-content">
          <form action="#">
            {itemData}
          </form>
        </div>
      </div>
    }
    </div>
  );
}

export default App;
