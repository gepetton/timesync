import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        y: 10,
        filter: 'blur(4px)'
      }}
      animate={{ 
        opacity: 1,
        y: 0,
        filter: 'blur(0px)'
      }}
      exit={{ 
        opacity: 0,
        y: -10,
        filter: 'blur(4px)'
      }}
      transition={{ 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 