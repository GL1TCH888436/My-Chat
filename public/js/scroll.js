function scroll(list) {
    function animate() {
        list.scrollLeft += 1;

        const item = list.children[0];

        if (
            item &&
            item.getBoundingClientRect().right <=
            list.getBoundingClientRect().left
        ) {
            const width = item.getBoundingClientRect().width;
            list.append(item);
            list.scrollLeft -= width;
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

// Все элементы с классом scroll
document.querySelectorAll('.scroll').forEach(list => {
    scroll(list);
});