# AWS-API
API deployed in AWS.
Node.JS - Express -  Axios - @yimura/scraper



Input: Band or Musician name.

I) Hits external API to get JSON with recommendations similar to the input given.

II) Store first 4 recommendations, and it makes web scrapping in youtube getting 4 Youtube video IDs for each one.

III) Creates playlist with video IDs.

IV) Return as response JSON with the link of the playlist generated.
