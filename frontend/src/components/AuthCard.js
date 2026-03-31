import { motion } from "framer-motion";

function AuthCard({ children }){

 return(

  <motion.div
    initial={{opacity:0,y:40}}
    animate={{opacity:1,y:0}}
    transition={{duration:0.4}}
    className="auth-card"
  >

   {children}

  </motion.div>

 );

}

export default AuthCard;