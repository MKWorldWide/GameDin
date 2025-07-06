import { Store } from '../types/store';

declare const useStore: <T = Store>(selector: (state: Store) => T) => T;
export default useStore;
