import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        y: 8
      }}
      animate={{ 
        opacity: 1,
        y: 0
      }}
      exit={{ 
        opacity: 0,
        y: -8
      }}
      transition={{ 
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 