import { createClient } from 'contentful'

class Contentful {

    constructor() {
        this.client= createClient({
        //space: '80c03r0wfd8q',
        //accessToken: 'D_yGVdTeebDfEbT-cM-TeNGDP5zXp3e7ResHmbzbG9w'
        space: 'ruvwf8pantm4',
        accessToken: 'xHAYR7mv0LcOLurSsBadXSVCTEmvqUwjfIjBmLSuhVI'
    })
    }

    /*
    async getCommutes() {
        let result = await this.client
            .getEntries({
                content_type: "commute"
            });
        console.log(result.items);
        return result.items;
    }
    */

    async getPosts() {
        let result = await this.client
            .getEntries({
                content_type: "posten"
            });
        console.log(result.items);
        return result.items;
    }

}

export default new Contentful();
