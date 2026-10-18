let ads = document.getElementsByClassName('ads')[0].children;
let i = 0;
setInterval(() => {
    for (let ad of ads) {
        ad.style.display = 'none';
    }

    ads[i].style.display = 'block';

    i = (i + 1) % ads.length;
},500);

