// Core calculation logic from /save3 — needed by Fee Drag Simulator and Fee Wedge
// State: investment, years, returnRate, highFee; lowFee = 0.1 (benchmark ETF)

const calculateGrowth = React.useCallback(() => {
    const dataLow = [];
    const dataHigh = [];
    const labels = [];
    
    let currentLow = investment;
    let currentHigh = investment;
    
    const rateLow = (returnRate - lowFee) / 100;
    const rateHigh = (returnRate - highFee) / 100;

    for (let i = 0; i <= years; i++) {
        labels.push(`Year ${i}`);
        dataLow.push(currentLow);
        dataHigh.push(currentHigh);
        currentLow = currentLow * (1 + rateLow);
        currentHigh = currentHigh * (1 + rateHigh);
    }

    return { labels, dataLow, dataHigh, finalLow: currentLow, finalHigh: currentHigh };
}, [investment, years, returnRate, highFee, lowFee]);

const results = calculateGrowth();
const lostWealth = results.finalLow - results.finalHigh;
