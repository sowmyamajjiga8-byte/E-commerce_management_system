import { useEffect, useState } from "react";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import api from "./api";

function Nav({ user, cartCount, onLogout }) {
  return <nav>
    <Link className="brand" to="/">ShopEasy</Link>
    <div className="navlinks">
      <Link to="/">Products</Link>
      {user && <Link to="/orders">My Orders</Link>}
      <Link to="/cart">Cart ({cartCount})</Link>
      {user ? <button onClick={onLogout}>Logout</button> : <>
        <Link to="/login">Login</Link><Link to="/register">Register</Link>
      </>}
    </div>
  </nav>;
}

function Products({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const load = async () => {
    const { data } = await api.get(`/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
    setProducts(data);
  };
  useEffect(() => { load(); }, [category]);

  return <main>
    <h1>Products</h1>
    <div className="filters">
      <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">All categories</option><option>Electronics</option><option>Fashion</option><option>Books</option><option>Home</option>
      </select>
      <button onClick={load}>Search</button>
    </div>
    <div className="grid">{products.map(p => <article className="card" key={p._id}>
      <img src={p.image} alt={p.name}/>
      <h3>{p.name}</h3><p>{p.description}</p><strong>₹{p.price}</strong>
      <small>Stock: {p.stock}</small>
      <button disabled={!p.stock} onClick={() => addToCart(p)}>Add to Cart</button>
    </article>)}</div>
  </main>;
}

function Login({ setUser }) {
  const nav = useNavigate(); const [form, setForm] = useState({email:"",password:""}); const [error,setError]=useState("");
  const submit = async e => { e.preventDefault(); try { const {data}=await api.post("/auth/login",form); localStorage.setItem("token",data.token); setUser(data.user); nav("/"); } catch(err){setError(err.response?.data?.message||"Login failed");} };
  return <Form title="Login" error={error} fields={form} setFields={setForm} submit={submit} button="Login"/>;
}

function Register() {
  const nav=useNavigate(); const [form,setForm]=useState({name:"",email:"",password:""}); const [error,setError]=useState("");
  const submit=async e=>{e.preventDefault();try{await api.post("/auth/register",form);nav("/login")}catch(err){setError(err.response?.data?.message||"Registration failed")}};
  return <Form title="Create Account" error={error} fields={form} setFields={setForm} submit={submit} button="Register"/>;
}

function Form({title,error,fields,setFields,submit,button}) {
  return <main className="form"><h1>{title}</h1>{error&&<p className="error">{error}</p>}<form onSubmit={submit}>
    {Object.keys(fields).map(k=><input key={k} type={k==="password"?"password":"text"} placeholder={k[0].toUpperCase()+k.slice(1)} value={fields[k]} onChange={e=>setFields({...fields,[k]:e.target.value})} required/>)}
    <button>{button}</button>
  </form></main>;
}

function Cart({ cart, setCart, user }) {
  const nav=useNavigate(); const [address,setAddress]=useState("");
  const total=cart.reduce((s,p)=>s+p.price*p.quantity,0);
  const remove=id=>setCart(cart.filter(p=>p._id!==id));
  const change=(id,q)=>setCart(cart.map(p=>p._id===id?{...p,quantity:Math.max(1,q)}:p));
  const checkout=async()=>{if(!user)return nav("/login"); if(!address.trim())return alert("Enter delivery address"); await api.post("/orders",{items:cart.map(p=>({product:p._id,quantity:p.quantity})),address}); setCart([]); alert("Order placed successfully"); nav("/orders");};
  return <main><h1>Shopping Cart</h1>{!cart.length?<p>Your cart is empty.</p>:<>
    {cart.map(p=><div className="cartrow" key={p._id}><span>{p.name}</span><input type="number" min="1" value={p.quantity} onChange={e=>change(p._id,+e.target.value)}/><span>₹{p.price*p.quantity}</span><button onClick={()=>remove(p._id)}>Remove</button></div>)}
    <h2>Total: ₹{total}</h2><textarea placeholder="Delivery address" value={address} onChange={e=>setAddress(e.target.value)}/><button onClick={checkout}>Place Order (COD)</button>
  </>}</main>;
}

function Orders() {
  const [orders,setOrders]=useState([]);
  useEffect(()=>{api.get("/orders/my").then(r=>setOrders(r.data))},[]);
  return <main><h1>My Orders</h1>{orders.map(o=><article className="order" key={o._id}><b>Order ID:</b> {o._id}<br/><b>Status:</b> {o.status}<br/><b>Total:</b> ₹{o.totalAmount}<br/><small>{new Date(o.createdAt).toLocaleString()}</small></article>)}</main>;
}

export default function App(){
  const [user,setUser]=useState(null); const [cart,setCart]=useState(()=>JSON.parse(localStorage.getItem("cart")||"[]"));
  useEffect(()=>{localStorage.setItem("cart",JSON.stringify(cart))},[cart]);
  const logout=()=>{localStorage.removeItem("token");setUser(null)};
  const addToCart=p=>setCart(c=>{const x=c.find(i=>i._id===p._id);return x?c.map(i=>i._id===p._id?{...i,quantity:i.quantity+1}:i):[...c,{...p,quantity:1}]});
  return <><Nav user={user} cartCount={cart.reduce((s,p)=>s+p.quantity,0)} onLogout={logout}/><Routes>
    <Route path="/" element={<Products addToCart={addToCart}/>}/><Route path="/login" element={<Login setUser={setUser}/>}/><Route path="/register" element={<Register/>}/>
    <Route path="/cart" element={<Cart cart={cart} setCart={setCart} user={user}/>}/><Route path="/orders" element={user?<Orders/>:<Navigate to="/login"/>}/>
  </Routes></>;
}
