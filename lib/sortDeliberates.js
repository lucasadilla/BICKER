export function sortDeliberates(debates, sort) {
    if (sort === 'oldest') {
        debates.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'newest') {
        debates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'mostPopular') {
        debates.sort(
            (a, b) => (b.votesRed + b.votesBlue) - (a.votesRed + a.votesBlue)
        );
    } else if (sort === 'mostDivisive') {
        debates.sort((a, b) => {
            const totalA = a.votesRed + a.votesBlue;
            const totalB = b.votesRed + b.votesBlue;
            const ratioA = totalA === 0 ? Infinity : Math.abs(a.votesRed - a.votesBlue) / totalA;
            const ratioB = totalB === 0 ? Infinity : Math.abs(b.votesRed - b.votesBlue) / totalB;
            if (ratioA === ratioB) {
                return totalB - totalA;
            }
            return ratioA - ratioB;
        });
    } else if (sort === 'mostDecisive') {
        debates.sort((a, b) => {
            const totalA = a.votesRed + a.votesBlue;
            const totalB = b.votesRed + b.votesBlue;
            const ratioA = totalA === 0 ? 0 : Math.abs(a.votesRed - a.votesBlue) / totalA;
            const ratioB = totalB === 0 ? 0 : Math.abs(b.votesRed - b.votesBlue) / totalB;
            if (ratioA === ratioB) {
                return totalB - totalA;
            }
            return ratioB - ratioA;
        });
    }
    return debates;
}
