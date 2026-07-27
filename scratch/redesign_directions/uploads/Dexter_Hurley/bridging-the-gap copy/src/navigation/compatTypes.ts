// TODO(esm): restore @react-navigation types after ESM migration
export type NativeStackNavigationProp<T = any> = any;
export type RouteProp<T = any, K extends keyof T = any> = any;

export function useNavigation<T = any>(): T {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	return (require("@react-navigation/native").useNavigation() as unknown) as T;
}

export function useRoute<T = any>(): T {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	return (require("@react-navigation/native").useRoute() as unknown) as T;
}

export function useFocusEffect(effect: any): any {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const fn = require("@react-navigation/native").useFocusEffect as any;
	return fn(effect);
}
