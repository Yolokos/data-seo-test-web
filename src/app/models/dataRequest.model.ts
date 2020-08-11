
export class DataRequest{
    constructor(
        public region?: string,
        public locationCode?: number,
        public searchEngine?: string,
        public keyWords?: Array<string>
    ){}
}