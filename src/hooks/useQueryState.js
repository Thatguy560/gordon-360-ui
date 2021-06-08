import { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export const types = {
  String: 'String',
  Array: 'Array',
  Boolean: 'Boolean',
};
const defaultValues = {
  String: '',
  Array: [],
  Boolean: false,
};

/**
 * Custom hook to useState synced with URL query parameters.
 * Inspiration from François Best https://github.com/47ng/next-usequerystate/tree/next/src
 *
 * useQueryState can be used in the place of useState for any variables that should be
 * stored and synced in the url. Supports the use of string, array, and boolean variables.
 * -- String Variable: key='key', state/value='theValue' -> URL='&value=theValue'
 * -- Array Variable: key='key', state/value='[one,two]' -> URL='&value=one%2Ctwo'
 * -- Boolean Variable: key='isKeyValue', state/value='true' -> URL='&isKeyValue=true'
 *
 * @param {String} key - key of the QueryState variable
 * @param {'String' | 'Array' | 'Boolean'} type - the type of variable
 * @param {String} [initial] - initial value of the QueryState variable
 *          *** CURRENTLY BROKEN when more than one useQueryState calls runs at once
 * @returns {[var, Callback]} - the state variable, the setQueryState callback function
 */
function useQueryState(key, type, initial = null) {
  if (type === undefined) {
    throw new Error(`Type must be one of the given types: ${Object.values(types)}`);
  }
  const defaultVal = defaultValues[type];
  const [state, setState] = useState(initial ?? defaultVal);
  const history = useHistory();
  const location = useLocation();
  const [initializing, setInitializing] = useState(true);

  const setQueryState = useCallback(
    (nextState) => {
      console.log(key, '- setQueryState called with nextState:', nextState);
      let urlParams = new URLSearchParams(location.search);

      // if the url value is already the same as the state value -> don't set the url again
      if (
        (nextState.toString() === urlParams.get(key) ?? defaultVal.toString()) ||
        (nextState === true && urlParams.get(key) === '')
      )
        return;

      console.log('Did not abort setting QueryState');

      // key with no value OR boolean key set to false -> absent from url, push empty
      if (!nextState || nextState === '' || nextState.length === 0 || nextState === false) {
        urlParams.delete(key);
      } else {
        urlParams.set(key, nextState.toString());
      }

      console.log('pushing to history:', urlParams.toString());

      history.push('?' + urlParams.toString());
    },
    [defaultVal, history, key, location.search],
  );

  useEffect(() => {
    if (initializing && initial && initial?.toString() !== defaultVal.toString()) {
      console.log('setting initial state');
      setQueryState(initial);
    }
    setInitializing(false);
  }, [defaultVal, initial, initializing, setQueryState]);

  useEffect(() => {
    const updateStateFromURL = async () => {
      if (!initializing) {
        const urlParams = new URLSearchParams(location.search);
        let urlValue = urlParams.get(key);

        switch (type) {
          case types.Boolean:
            setState(urlParams.has(key));
            return;

          case types.Array:
            // if the same value (or unset and state array is empty) -> do nothing
            if (urlValue === state.toString() || (!urlValue && state.length === 0)) return;
            else setState(urlValue?.split(',') ?? defaultVal);
            break;

          case types.String:
            setState(urlValue ?? defaultVal);
            break;

          default:
            throw new Error(`missing case for type ${type}`);
        }
      }
    };
    updateStateFromURL();
  }, [location.search, key, defaultVal, type, state, initializing]);

  return [state, setQueryState];
}
export default useQueryState;
