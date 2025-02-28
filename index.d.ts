/// <reference types="node" />

declare module "coders-twitter" {
   export default class Twitter {
      constructor(input?: string | null);

      setArgument(input?: string | null): void;
      /**
       * Set the URL to download
       * @param url Twitter URL (optional)
       * @returns Twitter instance with updated URL
       */
      download(url?: string | null): Promise<object>;

      /**
       * Get metadata user twitter with posted
       * @param username Twitter username (optional)
       * @returns metadata with some data posted
       */
      getPostUser(username?: string | null): Promise<object>;

      /**
       * Get metadata from username
       * @param username Twitter username (optional)
       * @returns metadata user already formatted
       */
      stalker(username?: string | null): Promise<object>;
   }
}