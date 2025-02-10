import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        y: 20,
        scale: 0.98,
        filter: 'blur(8px)'
      }}
      animate={{ 
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)'
      }}
      exit={{ 
        opacity: 0,
        y: -20,
        scale: 0.98,
        filter: 'blur(8px)'
      }}
      transition={{ 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 