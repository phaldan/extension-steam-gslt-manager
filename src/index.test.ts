test('index', () => {
    document.body.innerHTML = '<div id="root"></div>';
    require('./index');
    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(window.fetch).toHaveBeenCalledWith('https://steamcommunity.com/dev/managegameservers?l=english', {
        credentials: 'include',
        method: 'GET',
    });
});
