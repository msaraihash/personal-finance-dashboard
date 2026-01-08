import type { AssetClass, Currency } from './index';

export interface ManualAsset {
    id: string;
    name: string;
    value: number;
    currency: Currency;
    assetClass: AssetClass;
}
