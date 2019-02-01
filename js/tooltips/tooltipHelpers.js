const getPlayerTooltipMarkup = (wavingFlag, userData) => {
    const rating = userData.rating ? Math.floor(userData.rating.mu * 100) : 'N/A';
    return `
        <div class="playerTooltip">
            ${wavingFlag}
            <p style="padding-top: 0px; padding-bottom: 0px;">
                <strong>Rating:</strong> ${rating}
            </p>
            <p style="margin-top: 0px; padding-top: 0px;">
                <strong>Bio:</strong> ${userData.bio ? userData.bio : 'N/A'}
            </p>
        </div>
    `;
};

module.exports = { getPlayerTooltipMarkup };