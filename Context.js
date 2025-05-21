import { createContext, useState } from 'react';

const Context = createContext();

export const Provider = ({ children }) => {
  const [word, setWord] = useState('');

  return (
    <Context.Provider value={{ word, setWord }}>
      {children}
    </Context.Provider>
  );
};

export default Context;