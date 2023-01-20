- POST MVP
  - Error Boundary component for when app crashes
  - Following ability.
  - Video attachments
  - Make back button close media modal when modal is open instead of going back thru the history
      
  - Image background color from the image itself
  - Background color for attachments
  - Attachment compression and resizing as well as thumbnails using (https://github.com/lovell/sharp)
  - save an attachment's height to db when sending a message so we can use that to make sure the container has the proper height so no jumping happens with virtuoso (if an attachment's height exceeds 400px then we'll set the height to 400px since that's the max)

  - Profile picture cropping modal
  - Account deletion

  - Searching using post content
  - Show recent searches when focusing searchbar (recent searches will be saved in localstorage or indexedDB. Max of 5)

  - A notification system
  - notify people that are interested in an event when the event starts.
  - In-webapp message notification when receiving a message

  - Trending on sidebar (allowed in guest routes which will make the right side not empty and take up space so the middle part is not stretching)
  - Post reporting
  - Event sharing
  - Device sessions
  - tag-based searching/filtering for convos (`date:2022-03-02` or `name:illusion` or something like that) and maybe for general search too ?
  - emojis/emotes using twitter's bullshit thingy
  - actual messaging recommendation algo instead of just getting whatever rows
  - integrate tRPC
