import Twitter from "./index.js";
import fs from 'fs';

(async () => {
   try {
      const twitter = new Twitter();
      twitter.setArgument('Pai_C1');
      const response = await twitter.getPostUser();
      fs.writeFileSync('./test.json', JSON.stringify(response, null, 2));
      console.log(response);
   } catch (error) {
      console.error(error);
   }
})();