import { Outlet } from "react-router-dom" 
import Navbar from "./Navbar"
import Footer from "./Footer"

function Layout(){

return(

<div>
<Navbar></Navbar>
<div className="my-5 mb-20">
<Outlet></Outlet>

</div>
<Footer></Footer>

</div>
)
}
export default Layout