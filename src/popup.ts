declare var chrome: any;
const choices: [string,string,boolean][] = [["youtubeShorts","YouTube Shorts",true],["redditFeeds","Reddit home and popular feeds",true],["instagramReels","Instagram Reels",true],["instagramFeed","Instagram home feed",false],["tiktokFeed","TikTok For You feed",true],["tiktokAll","Entire TikTok website",false]];
chrome.storage.local.get(null, (saved: Record<string, boolean>) => {
 const container = document.getElementById('options')!;
 for (const [key,label,defaultValue] of choices) {
  const row = document.createElement('label'); const input = document.createElement('input');
  input.type = 'checkbox'; input.checked = saved[key] ?? defaultValue;
  input.addEventListener('change', () => chrome.storage.local.set({[key]:input.checked}));
  row.append(input, document.createTextNode(label)); container.append(row);
 }
});
