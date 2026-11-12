"use strict";
(() => {
    const defaults = { youtubeShorts: true, redditFeeds: true, instagramReels: true, instagramFeed: false, tiktokFeed: true, tiktokAll: false };
    let settings = { ...defaults };
    let scheduled = false;
    const host = location.hostname;
    const style = document.createElement('style');
    style.id = 'focus-blocker-style';
    const setStyle = () => {
        const css = [];
        if (host.endsWith('youtube.com') && settings.youtubeShorts)
            css.push('ytd-rich-shelf-renderer:has(a[href^="/shorts/"]),ytd-reel-shelf-renderer,ytd-guide-entry-renderer:has(a[href^="/shorts"]),ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]),ytd-video-renderer:has(a[href^="/shorts/"]),ytd-rich-item-renderer:has(a[href^="/shorts/"]){display:none!important}');
        if (host.endsWith('instagram.com') && settings.instagramReels)
            css.push('a[href^="/reels/"] ,a[href^="/reel/"]{display:none!important}');
        const rules = css.join('\n');
        if (style.textContent !== rules)
            style.textContent = rules;
        if (!style.isConnected)
            (document.head || document.documentElement)?.appendChild(style);
    };
    const block = () => {
        let reason = '';
        const path = location.pathname.replace(/\/+$/, '') || '/';
        if (host.endsWith('youtube.com') && settings.youtubeShorts && path.startsWith('/shorts/'))
            reason = 'YouTube Shorts is blocked.';
        if (host.endsWith('reddit.com') && settings.redditFeeds && (path === '/' || path === '/r/popular' || path === '/r/all'))
            reason = 'This Reddit feed is blocked.';
        if (host.endsWith('instagram.com') && ((settings.instagramReels && (path.startsWith('/reels') || path.startsWith('/reel/'))) || (settings.instagramFeed && path === '/')))
            reason = 'This Instagram feed is blocked.';
        if (host.endsWith('tiktok.com') && (settings.tiktokAll || (settings.tiktokFeed && (path === '/' || path === '/foryou'))))
            reason = 'This TikTok feed is blocked.';
        let overlay = document.getElementById('focus-blocker-overlay');
        if (!reason) {
            overlay?.remove();
            return;
        }
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'focus-blocker-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#f7f7fb;color:#202432;display:flex;align-items:center;justify-content:center;font:18px system-ui;text-align:center;padding:24px';
            (document.body || document.documentElement).appendChild(overlay);
        }
        const message = reason + ' Change this in the That’ll Do Now extension settings.';
        if (overlay.textContent !== message)
            overlay.textContent = message;
    };
    const update = () => { scheduled = false; setStyle(); block(); };
    const schedule = () => { if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(update);
    } };
    chrome.storage.local.get(null, (saved) => { settings = { ...defaults, ...saved }; schedule(); });
    chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local') {
        for (const key of Object.keys(defaults))
            if (changes[key])
                settings[key] = changes[key].newValue ?? defaults[key];
        schedule();
    } });
    new MutationObserver(schedule).observe(document.documentElement, { subtree: true, childList: true });
    window.addEventListener('popstate', schedule);
    window.addEventListener('yt-navigate-finish', schedule);
    let previous = location.href;
    setInterval(() => { if (location.href !== previous) {
        previous = location.href;
        schedule();
    } }, 500);
    schedule();
})();
