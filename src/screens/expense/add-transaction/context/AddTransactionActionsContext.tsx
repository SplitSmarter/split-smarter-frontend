import React, {createContext, useContext} from 'react';

type AddTransactionActions = {
    openDatePicker: () => void;
};

const AddTransactionActionsContext = createContext<AddTransactionActions>({
    openDatePicker: () => undefined,
});

export const AddTransactionActionsProvider = AddTransactionActionsContext.Provider;

export const useAddTransactionActions = () => useContext(AddTransactionActionsContext);
