import './App.css'

import { useState,useEffect} from 'react';

import Dexie from 'dexie'
import {useLiveQuery} from 'dexie-react-hooks';
import FlashMessage from 'react-flash-message';

const App = () => {
  // Database Initialization
  const db = new Dexie("MarketList");
    db.version(1).stores(
      {items: "++id,name,price,itemHasBeenPurchased"}
    )

  // State
  const allItems = useLiveQuery(()=>db.items.toArray(),[]);
  const [showMessage, setShowMessage] = useState(false);
  const [flashMessage, setFlashMessage] = useState('Success');
  

  // Hooks
  useEffect(()=>{
    setTimeout(()=>{
      setShowMessage(false)
    },2000)
  },[showMessage])

  // Database Methods
  const addItemToDb = async event => {
    event.preventDefault()
    const name = document.querySelector('.item-name').value
    const price = document.querySelector('.item-price').value
    await db.items.add({
      name,
      price:Number(price),
      itemHasBeenPurchased:false
    })
    document.querySelector('.item-name').value='';
    document.querySelector('.item-price').value='';
    setFlashMessage("Success! Item was added");
    setShowMessage(true);
  }
  
  const removeItemFromDb = async id => {
    await db.items.delete(id)
    setFlashMessage("Success! Item was deleted")
    setShowMessage(true)
  }
  
  const markAsPurchased = async (id,event) => {
    if (event.target.checked){
      await db.items.update(id,{itemHasBeenPurchased:true})
      setFlashMessage("Item marked as complete")
      setShowMessage(true)
    }
    else{
      await db.items.update(id,{itemHasBeenPurchased:false})
      setFlashMessage("Item marked as to-do")
      setShowMessage(true)
    }
  }

  const clearCache = (event) => {
    event.preventDefault()
    db.tables.forEach(function (table) {
      table.clear();
    });
    setFlashMessage("All tables cleared successfully")
    setShowMessage(true)
  }
  
  if (!allItems) return null

  // Render
  const itemData = allItems.map(({id,name,price,itemHasBeenPurchased})=>(
    <div className='row' key={id}>
      <p className='col s5'>
        <label>
          <input type="checkbox" checked={itemHasBeenPurchased} onChange={event => markAsPurchased(id,event)}></input>
          <span className='black-text'>{name}</span>
        </label>
      </p>
      <p className='col s5'>${price}</p>
      <i onClick={() => removeItemFromDb(id)} className='col s2 material-icons delete-button'>delete</i>
    </div>
  ))
  

  return (
    <div className="container">
      <h3 className="green-text center-align">Market List App</h3>
      <form className="add-item-form" onSubmit={event => addItemToDb(event)}>
        <input className='item-name' type="text" placeholder="Name of item" required />
        <input className='item-price' type="number" placeholder="Price in USD" required />
        <button type="submit" className="waves-effect waves-light btn right">Add item</button>
        <button className='waves-effect waves-light red btn' onClick={event => clearCache(event)}> Clear Tables</button>
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

    { showMessage &&  
          <div>
              <FlashMessage duration={2000}>
                  <strong className='chip green'>{flashMessage}</strong>
              </FlashMessage>
          </div>
    }
    </div>
  );
}

export default App;
