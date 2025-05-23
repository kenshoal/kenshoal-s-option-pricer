const API_KEY = 'XMM0T2BJS45S4A92';
function cdfNormal(x, mean = 0, std = 1) {
    const z = (x - mean) / (std * Math.sqrt(2));
    const sign = z < 0 ? -1 : 1;
    const t = 1 / (1 + 0.3275911 * Math.abs(z));
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    
    const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    
    return 0.5 * (1 + sign * erf);
  }
  

function fetchStockPrice(symbol) {
  fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
        
      const price = data['Global Quote']['05. price'];
      document.getElementById('price').value = `${price}`;
    })
    .catch(error => console.error('Error fetching stock data:', error));
    
}

document.getElementById("priceform").addEventListener("submit", function(event){
    event.preventDefault(); 
    var symbol = document.getElementById("stockticker").value;
    fetchStockPrice(symbol);}   
);
function getIV(){
    const k = document.getElementById('strikeprice').value;
    var symbol = document.getElementById("stockticker").value;
    fetch(`https://www.alphavantage.co/query?function=HISTORICAL_OPTIONS&symbol=${symbol}&apikey=${API_KEY}`)
    .then(response=>response.json())
    .then(data =>{
        for(const dict of data['data']){
            if(dict['type'] == 'call' && dict['strike'] == k){
                const iv = dict['implied_volatility'];
                document.getElementById("iv").value = iv;
                break;
            } 
        }
    })
}
document.getElementById('fetch').addEventListener('click',function(event){
    getIV();
})
document.getElementById("theo").addEventListener("submit", function(event){
    const spot = parseFloat(document.getElementById('price').value);
    event.preventDefault();
    BlackScholesCall(spot);
});

function BlackScholesCall(spot){
    const iv = parseFloat(document.getElementById('iv').value)/100 || 0; //implied vol
    const k = parseFloat(document.getElementById('strikeprice').value) || 0;  //strikeprice
    const r = parseFloat(document.getElementById('r').value)/100 || 0;  //risk-free interest rate
    const t= parseFloat(document.getElementById('t').value)/365 || 0;  //time to maturity
    const d1 = ((Math.log(spot/k))+ (r+(iv**2)/2)*t)/(iv*Math.sqrt(t));
    const d2 = d1-(iv*Math.sqrt(t));
    const Nd1 = cdfNormal(d1);
    const Nd2 = cdfNormal(d2);
    const c = Nd1*spot-Nd2*k*(Math.exp(-r*t)); //callprice
    document.getElementById('optprice').value = `${c.toFixed(5)}`;
    
}

function calculatecc(){
    
    const optprice = parseFloat(document.getElementById('optprice').value) || 0;
    const quantity = parseInt(document.getElementById('connum').value) || 0;
    const tc = optprice * quantity * 100;
    document.getElementById('contractcost').textContent = `$${tc.toFixed(2)}`;
}

document.getElementById('optprice').addEventListener("input", function(event){
    calculatecc();});
document.getElementById('connum').addEventListener("input", function(event){ 
    calculatecc();});




