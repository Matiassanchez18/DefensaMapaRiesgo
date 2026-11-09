import { Outlet } from "react-router-dom" 
import Navbar from "./Navbar"
import Footer from "./Footer"

function Layout(){

return(

<div>
<Navbar></Navbar>
<Outlet></Outlet>
<Footer></Footer>

</div>
)
}
export default Layout