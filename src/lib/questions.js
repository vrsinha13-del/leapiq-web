// Leap IQ — Complete Question Bank v1
// 200+ questions across 4 subjects, multiple topics, 3 difficulty levels
// Format: { id, topic, difficulty, q, opts, ans, exp }

export const QB = {

  // ════════════════════════════════════════════════════════════
  // MATHS
  // ════════════════════════════════════════════════════════════
  maths: [

    // ── DECIMALS ─────────────────────────────────────────────
    // Easy
    { id:'md-e01', topic:'decimals', difficulty:'easy', q:'What is 0.5 + 0.3?', opts:['0.7','0.8','0.9','1.0'], ans:'0.8', exp:'Add tenths: 5+3=8 → 0.8' },
    { id:'md-e02', topic:'decimals', difficulty:'easy', q:'What is 1.2 − 0.4?', opts:['0.6','0.7','0.8','0.9'], ans:'0.8', exp:'1.2 − 0.4 = 0.8' },
    { id:'md-e03', topic:'decimals', difficulty:'easy', q:'Which is greater: 0.9 or 0.89?', opts:['0.9','0.89','Equal','Cannot say'], ans:'0.9', exp:'0.9 = 0.90 which is greater than 0.89' },
    { id:'md-e04', topic:'decimals', difficulty:'easy', q:'What is 0.1 × 10?', opts:['0.01','0.1','1','10'], ans:'1', exp:'Multiplying by 10 moves decimal one place right' },
    { id:'md-e05', topic:'decimals', difficulty:'easy', q:'Convert 1/4 to decimal:', opts:['0.2','0.25','0.4','0.5'], ans:'0.25', exp:'1÷4 = 0.25' },
    { id:'md-e06', topic:'decimals', difficulty:'easy', q:'Round 3.76 to 1 decimal place:', opts:['3.7','3.8','4.0','3.6'], ans:'3.8', exp:'Second decimal 6 ≥ 5, round up → 3.8' },
    { id:'md-e07', topic:'decimals', difficulty:'easy', q:'What is 2.5 + 1.5?', opts:['3.0','4.0','3.5','4.5'], ans:'4.0', exp:'2.5 + 1.5 = 4.0' },
    { id:'md-e08', topic:'decimals', difficulty:'easy', q:'Which decimal is smallest: 0.3, 0.03, 0.33, 0.303?', opts:['0.3','0.03','0.33','0.303'], ans:'0.03', exp:'0.03 = 3 hundredths, smallest of all' },
    { id:'md-e09', topic:'decimals', difficulty:'easy', q:'What is 5.0 − 2.5?', opts:['2.0','2.5','3.0','3.5'], ans:'2.5', exp:'5.0 − 2.5 = 2.5' },
    { id:'md-e10', topic:'decimals', difficulty:'easy', q:'Convert 3/10 to decimal:', opts:['0.03','0.3','3.0','0.003'], ans:'0.3', exp:'3 ÷ 10 = 0.3' },
    // Medium
    { id:'md-m01', topic:'decimals', difficulty:'medium', q:'What is 3.14 × 2?', opts:['6.18','6.28','6.38','6.48'], ans:'6.28', exp:'3.14 × 2 = 6.28' },
    { id:'md-m02', topic:'decimals', difficulty:'medium', q:'What is 5.6 ÷ 0.7?', opts:['6','7','8','9'], ans:'8', exp:'Multiply both by 10: 56 ÷ 7 = 8' },
    { id:'md-m03', topic:'decimals', difficulty:'medium', q:'Express 0.125 as a fraction:', opts:['1/4','1/6','1/8','1/10'], ans:'1/8', exp:'0.125 = 125/1000 = 1/8' },
    { id:'md-m04', topic:'decimals', difficulty:'medium', q:'Round 7.856 to 2 decimal places:', opts:['7.85','7.86','7.9','8.0'], ans:'7.86', exp:'Third decimal 6 ≥ 5, round up → 7.86' },
    { id:'md-m05', topic:'decimals', difficulty:'medium', q:'What is 12.5 − 3.75?', opts:['8.25','8.75','9.25','9.75'], ans:'8.75', exp:'12.50 − 3.75 = 8.75' },
    { id:'md-m06', topic:'decimals', difficulty:'medium', q:'What is 0.4²?', opts:['0.08','0.16','0.4','1.6'], ans:'0.16', exp:'0.4 × 0.4 = 0.16' },
    { id:'md-m07', topic:'decimals', difficulty:'medium', q:'A pen costs ₹12.50. Cost of 4 pens?', opts:['₹48','₹49','₹50','₹52'], ans:'₹50', exp:'12.50 × 4 = ₹50.00' },
    { id:'md-m08', topic:'decimals', difficulty:'medium', q:'0.001 × 1000 = ?', opts:['0.1','1','10','100'], ans:'1', exp:'Move decimal 3 places right: 0.001 → 1' },
    // Hard
    { id:'md-h01', topic:'decimals', difficulty:'hard', q:'If 2.4x = 16.8, then x = ?', opts:['6','7','8','9'], ans:'7', exp:'x = 16.8 ÷ 2.4 = 7' },
    { id:'md-h02', topic:'decimals', difficulty:'hard', q:'Shopkeeper buys for ₹125.50, sells for ₹156.75. Profit?', opts:['₹31.25','₹31.50','₹30.75','₹32.25'], ans:'₹31.25', exp:'156.75 − 125.50 = 31.25' },
    { id:'md-h03', topic:'decimals', difficulty:'hard', q:'(0.2)³ = ?', opts:['0.006','0.008','0.012','0.016'], ans:'0.008', exp:'0.2 × 0.2 × 0.2 = 0.008' },
    { id:'md-h04', topic:'decimals', difficulty:'hard', q:'1 kg sugar = ₹45.75. Cost of 3.5 kg?', opts:['₹160.125','₹160.25','₹160.50','₹161'], ans:'₹160.125', exp:'45.75 × 3.5 = 160.125' },
    { id:'md-h05', topic:'decimals', difficulty:'hard', q:'If 0.3 of a number is 4.5, the number is:', opts:['13.5','15','1.35','150'], ans:'15', exp:'x = 4.5 ÷ 0.3 = 15' },

    // ── FRACTIONS ─────────────────────────────────────────────
    // Easy
    { id:'mf-e01', topic:'fractions', difficulty:'easy', q:'What is 1/2 + 1/4?', opts:['2/6','3/4','1/4','2/4'], ans:'3/4', exp:'LCD=4: 2/4 + 1/4 = 3/4' },
    { id:'mf-e02', topic:'fractions', difficulty:'easy', q:'Simplify 6/12:', opts:['1/3','1/2','2/3','3/4'], ans:'1/2', exp:'GCD(6,12)=6 → 1/2' },
    { id:'mf-e03', topic:'fractions', difficulty:'easy', q:'Which fraction is largest: 1/2, 1/3, 1/4, 1/5?', opts:['1/2','1/3','1/4','1/5'], ans:'1/2', exp:'Larger denominator = smaller fraction' },
    { id:'mf-e04', topic:'fractions', difficulty:'easy', q:'What is 3/5 of 25?', opts:['10','12','15','20'], ans:'15', exp:'(3/5) × 25 = 15' },
    { id:'mf-e05', topic:'fractions', difficulty:'easy', q:'Convert 5/4 to a mixed number:', opts:['1¼','1½','1¾','2¼'], ans:'1¼', exp:'5 ÷ 4 = 1 remainder 1 → 1¼' },
    { id:'mf-e06', topic:'fractions', difficulty:'easy', q:'What is 2/3 − 1/3?', opts:['1/3','2/3','1/6','1'], ans:'1/3', exp:'Same denominator: 2−1=1 → 1/3' },
    { id:'mf-e07', topic:'fractions', difficulty:'easy', q:'What fraction of 1 hour is 30 minutes?', opts:['1/4','1/3','1/2','3/4'], ans:'1/2', exp:'30/60 = 1/2' },
    { id:'mf-e08', topic:'fractions', difficulty:'easy', q:'3/4 = ?/12', opts:['6','8','9','10'], ans:'9', exp:'3/4 × 3/3 = 9/12' },
    { id:'mf-e09', topic:'fractions', difficulty:'easy', q:'What is 1/2 of 40?', opts:['10','15','20','25'], ans:'20', exp:'(1/2) × 40 = 20' },
    { id:'mf-e10', topic:'fractions', difficulty:'easy', q:'Which is smaller: 3/4 or 2/3?', opts:['3/4','2/3','Equal','Cannot say'], ans:'2/3', exp:'3/4=0.75, 2/3≈0.667, so 2/3 is smaller' },
    // Medium
    { id:'mf-m01', topic:'fractions', difficulty:'medium', q:'What is 2/3 × 3/4?', opts:['1/4','1/2','5/12','6/12'], ans:'1/2', exp:'(2×3)/(3×4) = 6/12 = 1/2' },
    { id:'mf-m02', topic:'fractions', difficulty:'medium', q:'What is 5/6 ÷ 2/3?', opts:['5/4','10/18','3/5','1/4'], ans:'5/4', exp:'5/6 × 3/2 = 15/12 = 5/4' },
    { id:'mf-m03', topic:'fractions', difficulty:'medium', q:'If 2/5 of a number is 18, the number is:', opts:['36','40','45','50'], ans:'45', exp:'x = 18 × (5/2) = 45' },
    { id:'mf-m04', topic:'fractions', difficulty:'medium', q:'What fraction of 1 hour is 45 minutes?', opts:['1/2','3/4','2/3','4/5'], ans:'3/4', exp:'45/60 = 3/4' },
    { id:'mf-m05', topic:'fractions', difficulty:'medium', q:'Recipe needs 3/4 cup sugar for 12 cookies. For 20 cookies?', opts:['1¼','1½','1¾','2¼'], ans:'1¼', exp:'(3/4)×(20/12) = 5/4 = 1¼' },
    { id:'mf-m06', topic:'fractions', difficulty:'medium', q:'Simplify: 15/35', opts:['1/3','2/5','3/7','5/7'], ans:'3/7', exp:'GCD(15,35)=5 → 3/7' },
    // Hard
    { id:'mf-h01', topic:'fractions', difficulty:'hard', q:'Tank is 2/3 full. After 1/4 is used, fraction remaining?', opts:['5/12','1/2','7/12','2/3'], ans:'1/2', exp:'2/3 − (1/4 × 2/3) = 2/3 − 1/6 = 1/2' },
    { id:'mf-h02', topic:'fractions', difficulty:'hard', q:'If 3/7 of X = 2/5 of Y, then X:Y = ?', opts:['14:15','15:14','6:35','35:6'], ans:'14:15', exp:'X/Y = (2/5)/(3/7) = 14/15' },
    { id:'mf-h03', topic:'fractions', difficulty:'hard', q:'Ascending order: 5/6, 7/9, 11/14', opts:['7/9 < 11/14 < 5/6','5/6 < 7/9 < 11/14','11/14 < 7/9 < 5/6','7/9 < 5/6 < 11/14'], ans:'7/9 < 11/14 < 5/6', exp:'7/9≈0.778, 11/14≈0.786, 5/6≈0.833' },
    { id:'mf-h04', topic:'fractions', difficulty:'hard', q:'What is 1 + 1/(1 + 1/2)?', opts:['5/3','7/5','8/5','9/5'], ans:'5/3', exp:'1 + 1/(3/2) = 1 + 2/3 = 5/3' },

    // ── ALGEBRA ──────────────────────────────────────────────
    // Easy
    { id:'ma-e01', topic:'algebra', difficulty:'easy', q:'If x + 5 = 12, what is x?', opts:['5','6','7','8'], ans:'7', exp:'x = 12 − 5 = 7' },
    { id:'ma-e02', topic:'algebra', difficulty:'easy', q:'If 3x = 18, what is x?', opts:['4','5','6','7'], ans:'6', exp:'x = 18 ÷ 3 = 6' },
    { id:'ma-e03', topic:'algebra', difficulty:'easy', q:'Simplify: 2x + 3x', opts:['5','5x','6x','23x'], ans:'5x', exp:'Like terms: 2x + 3x = 5x' },
    { id:'ma-e04', topic:'algebra', difficulty:'easy', q:'If y − 4 = 10, what is y?', opts:['6','10','14','40'], ans:'14', exp:'y = 10 + 4 = 14' },
    { id:'ma-e05', topic:'algebra', difficulty:'easy', q:'Value of 2x when x = 5:', opts:['5','7','10','25'], ans:'10', exp:'2 × 5 = 10' },
    { id:'ma-e06', topic:'algebra', difficulty:'easy', q:'If 4x = 20, then x = ?', opts:['4','5','6','8'], ans:'5', exp:'x = 20 ÷ 4 = 5' },
    { id:'ma-e07', topic:'algebra', difficulty:'easy', q:'Simplify: 5a + 3b − 2a', opts:['3a+3b','7a+3b','3a−3b','6ab'], ans:'3a+3b', exp:'5a−2a=3a, keep 3b → 3a+3b' },
    { id:'ma-e08', topic:'algebra', difficulty:'easy', q:'If x/3 = 4, then x = ?', opts:['7','12','4/3','3/4'], ans:'12', exp:'x = 4 × 3 = 12' },
    // Medium
    { id:'ma-m01', topic:'algebra', difficulty:'medium', q:'Solve: 2x + 3 = 11', opts:['3','4','5','6'], ans:'4', exp:'2x = 8, x = 4' },
    { id:'ma-m02', topic:'algebra', difficulty:'medium', q:'Expand: 3(x + 4)', opts:['3x+4','3x+7','3x+12','x+12'], ans:'3x+12', exp:'3×x + 3×4 = 3x+12' },
    { id:'ma-m03', topic:'algebra', difficulty:'medium', q:'If 5x − 2 = 13, what is x?', opts:['2','3','4','5'], ans:'3', exp:'5x = 15, x = 3' },
    { id:'ma-m04', topic:'algebra', difficulty:'medium', q:'If 2x + 1 = x + 7, then x = ?', opts:['4','5','6','7'], ans:'6', exp:'2x−x = 7−1, x = 6' },
    { id:'ma-m05', topic:'algebra', difficulty:'medium', q:'Factorise: x² + 5x + 6', opts:['(x+2)(x+3)','(x+1)(x+6)','(x+2)(x+4)','(x+3)(x+3)'], ans:'(x+2)(x+3)', exp:'Find two numbers that add to 5 and multiply to 6: 2 and 3' },
    { id:'ma-m06', topic:'algebra', difficulty:'medium', q:'If a = 3 and b = 2, find a² + b²:', opts:['10','11','12','13'], ans:'13', exp:'3² + 2² = 9 + 4 = 13' },
    // Hard
    { id:'ma-h01', topic:'algebra', difficulty:'hard', q:'Solve: 3x + 7 = 2x + 15', opts:['6','7','8','9'], ans:'8', exp:'3x−2x = 15−7, x = 8' },
    { id:'ma-h02', topic:'algebra', difficulty:'hard', q:'If 2(x+3) = 3(x−1), find x:', opts:['7','8','9','10'], ans:'9', exp:'2x+6=3x−3, 9=x' },
    { id:'ma-h03', topic:'algebra', difficulty:'hard', q:'Sum of 3 consecutive integers is 48. Smallest is:', opts:['14','15','16','17'], ans:'15', exp:'n+(n+1)+(n+2)=48, 3n+3=48, n=15' },
    { id:'ma-h04', topic:'algebra', difficulty:'hard', q:'If x² = 49, what are the values of x?', opts:['7 only','−7 only','±7','±49'], ans:'±7', exp:'x² = 49 → x = +7 or −7' },

    // ── PERCENTAGES ──────────────────────────────────────────
    // Easy
    { id:'mp-e01', topic:'percentages', difficulty:'easy', q:'What is 50% of 80?', opts:['30','35','40','45'], ans:'40', exp:'50% = 1/2, so 80÷2 = 40' },
    { id:'mp-e02', topic:'percentages', difficulty:'easy', q:'What is 10% of 200?', opts:['10','15','20','25'], ans:'20', exp:'10% of 200 = 200÷10 = 20' },
    { id:'mp-e03', topic:'percentages', difficulty:'easy', q:'25% as a fraction is:', opts:['1/2','1/3','1/4','1/5'], ans:'1/4', exp:'25% = 25/100 = 1/4' },
    { id:'mp-e04', topic:'percentages', difficulty:'easy', q:'What % of 50 is 10?', opts:['5%','10%','15%','20%'], ans:'20%', exp:'(10/50)×100 = 20%' },
    { id:'mp-e05', topic:'percentages', difficulty:'easy', q:'Convert 3/4 to percentage:', opts:['55%','65%','70%','75%'], ans:'75%', exp:'(3/4)×100 = 75%' },
    { id:'mp-e06', topic:'percentages', difficulty:'easy', q:'What is 1% of 500?', opts:['1','5','50','500'], ans:'5', exp:'1% of 500 = 500÷100 = 5' },
    { id:'mp-e07', topic:'percentages', difficulty:'easy', q:'What is 100% of 75?', opts:['7.5','75','750','7500'], ans:'75', exp:'100% of any number = the number itself' },
    // Medium
    { id:'mp-m01', topic:'percentages', difficulty:'medium', q:'A shirt costs ₹800. After 15% discount, price is?', opts:['₹620','₹640','₹660','₹680'], ans:'₹680', exp:'Discount = 15% of 800 = 120; 800−120=680' },
    { id:'mp-m02', topic:'percentages', difficulty:'medium', q:'Price increased from ₹200 to ₹250. % increase?', opts:['20%','25%','30%','35%'], ans:'25%', exp:'(50/200)×100 = 25%' },
    { id:'mp-m03', topic:'percentages', difficulty:'medium', q:'In a class of 40, 60% are girls. How many boys?', opts:['14','16','18','20'], ans:'16', exp:'Girls=24, Boys=40−24=16' },
    { id:'mp-m04', topic:'percentages', difficulty:'medium', q:'What is 12.5% of 160?', opts:['15','18','20','22'], ans:'20', exp:'12.5% = 1/8; 160÷8=20' },
    { id:'mp-m05', topic:'percentages', difficulty:'medium', q:'A number increased by 20% gives 60. The number is:', opts:['40','48','50','55'], ans:'50', exp:'x × 1.2 = 60, x = 50' },
    // Hard
    { id:'mp-h01', topic:'percentages', difficulty:'hard', q:'₹5000 at 8% p.a. simple interest for 3 years. Total?', opts:['₹5800','₹6000','₹6200','₹6400'], ans:'₹6200', exp:'SI = 5000×8×3/100 = 1200; Total=6200' },
    { id:'mp-h02', topic:'percentages', difficulty:'hard', q:'After 10% loss and 10% gain, net effect?', opts:['No change','1% loss','1% gain','2% loss'], ans:'1% loss', exp:'0.9 × 1.1 = 0.99 → net 1% loss' },
    { id:'mp-h03', topic:'percentages', difficulty:'hard', q:'Population grows 10% p.a. After 2 years from 10000?', opts:['12000','12100','12200','11000'], ans:'12100', exp:'10000 × 1.1 × 1.1 = 12100' },

    // ── EXPONENTS ────────────────────────────────────────────
    // Easy
    { id:'me-e01', topic:'exponents', difficulty:'easy', q:'What is 2³?', opts:['6','8','9','12'], ans:'8', exp:'2³ = 2×2×2 = 8' },
    { id:'me-e02', topic:'exponents', difficulty:'easy', q:'What is 5²?', opts:['10','15','20','25'], ans:'25', exp:'5² = 5×5 = 25' },
    { id:'me-e03', topic:'exponents', difficulty:'easy', q:'Any number to the power 0 equals:', opts:['0','1','The number itself','Undefined'], ans:'1', exp:'Any non-zero number raised to 0 = 1' },
    { id:'me-e04', topic:'exponents', difficulty:'easy', q:'What is 3⁴?', opts:['12','27','64','81'], ans:'81', exp:'3⁴ = 3×3×3×3 = 81' },
    { id:'me-e05', topic:'exponents', difficulty:'easy', q:'What is 10²?', opts:['20','100','1000','200'], ans:'100', exp:'10² = 10×10 = 100' },
    { id:'me-e06', topic:'exponents', difficulty:'easy', q:'What is 4¹?', opts:['1','4','16','64'], ans:'4', exp:'Any number to the power 1 equals itself' },
    // Medium
    { id:'me-m01', topic:'exponents', difficulty:'medium', q:'Simplify: 2³ × 2⁴', opts:['2⁷','2¹²','4⁷','2⁶'], ans:'2⁷', exp:'Same base: add exponents. 2^(3+4) = 2⁷' },
    { id:'me-m02', topic:'exponents', difficulty:'medium', q:'What is (3²)³?', opts:['3⁵','3⁶','3⁸','9³'], ans:'3⁶', exp:'Power of power: multiply exponents. 3^(2×3) = 3⁶' },
    { id:'me-m03', topic:'exponents', difficulty:'medium', q:'Simplify: 5⁶ ÷ 5²', opts:['5³','5⁴','5⁸','1'], ans:'5⁴', exp:'Same base division: 5^(6−2) = 5⁴' },
    { id:'me-m04', topic:'exponents', difficulty:'medium', q:'Express 64 as a power of 2:', opts:['2⁴','2⁵','2⁶','2⁸'], ans:'2⁶', exp:'64 = 2×2×2×2×2×2 = 2⁶' },
    // Hard
    { id:'me-h01', topic:'exponents', difficulty:'hard', q:'Value of 2⁻³:', opts:['−8','−6','1/6','1/8'], ans:'1/8', exp:'2⁻³ = 1/2³ = 1/8' },
    { id:'me-h02', topic:'exponents', difficulty:'hard', q:'If 2^x = 32, then x = ?', opts:['4','5','6','7'], ans:'5', exp:'32 = 2⁵, so x = 5' },
    { id:'me-h03', topic:'exponents', difficulty:'hard', q:'Simplify: (2³ × 3²) ÷ (2² × 3)', opts:['2×3','6','2×3²','2²×3'], ans:'6', exp:'= 2^(3-2) × 3^(2-1) = 2¹ × 3¹ = 6' },

    // ── RATIONAL NUMBERS ─────────────────────────────────────
    // Easy
    { id:'mr-e01', topic:'rational_numbers', difficulty:'easy', q:'Is −3/4 a rational number?', opts:['Yes','No','Only positives','Not sure'], ans:'Yes', exp:'Any number expressible as p/q is rational, including negatives' },
    { id:'mr-e02', topic:'rational_numbers', difficulty:'easy', q:'Additive inverse of 3/5:', opts:['−3/5','5/3','−5/3','3/−5'], ans:'−3/5', exp:'Additive inverse: change the sign' },
    { id:'mr-e03', topic:'rational_numbers', difficulty:'easy', q:'Which is NOT a rational number?', opts:['√2','1/3','−7','0.5'], ans:'√2', exp:'√2 cannot be expressed exactly as p/q' },
    { id:'mr-e04', topic:'rational_numbers', difficulty:'easy', q:'(−1/2) + (−1/2) = ?', opts:['−1','0','1','−1/4'], ans:'−1', exp:'−1/2 + −1/2 = −2/2 = −1' },
    { id:'mr-e05', topic:'rational_numbers', difficulty:'easy', q:'How many rational numbers are between 3 and 4?', opts:['1','10','100','Infinite'], ans:'Infinite', exp:'Between any two rationals, infinitely many exist' },
    { id:'mr-e06', topic:'rational_numbers', difficulty:'easy', q:'(−3) × (−1/3) = ?', opts:['−1','0','1','3'], ans:'1', exp:'Negative × negative = positive; 3 × 1/3 = 1' },
    // Medium
    { id:'mr-m01', topic:'rational_numbers', difficulty:'medium', q:'(−3/4) ÷ (9/16) = ?', opts:['−3/4','−4/3','3/4','4/3'], ans:'−4/3', exp:'−3/4 × 16/9 = −48/36 = −4/3' },
    { id:'mr-m02', topic:'rational_numbers', difficulty:'medium', q:'Product of two rationals is −9/16. One is 3/4. Other?', opts:['−3/4','3/4','−3/16','−3/12'], ans:'−3/4', exp:'(−9/16) ÷ (3/4) = −3/4' },
    { id:'mr-m03', topic:'rational_numbers', difficulty:'medium', q:'a×(b+c) = ab+ac is which property?', opts:['Commutative','Associative','Distributive','Closure'], ans:'Distributive', exp:'This is the distributive property of multiplication over addition' },
    // Hard
    { id:'mr-h01', topic:'rational_numbers', difficulty:'hard', q:'Solve: x/3 + x/4 = 7/12', opts:['x=1','x=−1','x=1/2','x=2'], ans:'x=1', exp:'LCD=12: 4x+3x=7, 7x=7, x=1' },
    { id:'mr-h02', topic:'rational_numbers', difficulty:'hard', q:'If x=−2/3, y=3/4, find x²−y²:', opts:['−17/144','17/144','−65/144','65/144'], ans:'−17/144', exp:'x²=4/9=64/144, y²=9/16=81/144; 64−81=−17/144' },
  ],

  // ════════════════════════════════════════════════════════════
  // ENGLISH
  // ════════════════════════════════════════════════════════════
  english: [

    // ── GRAMMAR ──────────────────────────────────────────────
    // Easy
    { id:'eg-e01', topic:'grammar', difficulty:'easy', q:'Which sentence is correct?', opts:["She don't like apples.","She doesn't likes apples.","She doesn't like apples.","She not like apples."], ans:"She doesn't like apples.", exp:"Third person singular: doesn't + base verb" },
    { id:'eg-e02', topic:'grammar', difficulty:'easy', q:'Fill in: "___ umbrella was lost."', opts:['A','An','The','—'], ans:'An', exp:'An before vowel sounds (umbrella starts with vowel sound)' },
    { id:'eg-e03', topic:'grammar', difficulty:'easy', q:'Plural of "child":', opts:['childs','childes','children','childrens'], ans:'children', exp:'Irregular plural: child → children' },
    { id:'eg-e04', topic:'grammar', difficulty:'easy', q:'Which word is an adverb? "He ran quickly."', opts:['He','ran','quickly','None'], ans:'quickly', exp:'Adverbs modify verbs; quickly modifies ran' },
    { id:'eg-e05', topic:'grammar', difficulty:'easy', q:'Correct past tense of "go":', opts:['goed','gone','went','goes'], ans:'went', exp:'Irregular verb: go → went' },
    { id:'eg-e06', topic:'grammar', difficulty:'easy', q:'"The sun ___ in the east." (rise)', opts:['rise','rises','rose','rising'], ans:'rises', exp:'Third person singular present: rises' },
    { id:'eg-e07', topic:'grammar', difficulty:'easy', q:'Plural of "mouse":', opts:['mouses','mouse','mices','mice'], ans:'mice', exp:'Irregular plural: mouse → mice' },
    { id:'eg-e08', topic:'grammar', difficulty:'easy', q:'Which is a proper noun?', opts:['city','happiness','India','book'], ans:'India', exp:'Proper nouns are specific names — India is a specific country' },
    { id:'eg-e09', topic:'grammar', difficulty:'easy', q:'"She ___ a doctor." Correct form of "be":', opts:['am','is','are','were'], ans:'is', exp:'She is singular third person, use is' },
    { id:'eg-e10', topic:'grammar', difficulty:'easy', q:'Which word is an adjective? "She wore a red dress."', opts:['She','wore','red','dress'], ans:'red', exp:'Adjectives describe nouns; red describes dress' },
    { id:'eg-e11', topic:'grammar', difficulty:'easy', q:'Correct sentence:', opts:['He go to school daily.','He goes to school daily.','He going to school daily.','He gone to school daily.'], ans:'He goes to school daily.', exp:'Third person singular present: goes' },
    { id:'eg-e12', topic:'grammar', difficulty:'easy', q:'Plural of "leaf":', opts:['leafs','leaves','leafes','leaf'], ans:'leaves', exp:'Words ending in f/fe → replace with ves: leaf → leaves' },
    // Medium
    { id:'eg-m01', topic:'grammar', difficulty:'medium', q:'Passive voice of "Tom wrote the letter."', opts:['The letter wrote by Tom.','The letter was written by Tom.','The letter is written by Tom.','The letter has written by Tom.'], ans:'The letter was written by Tom.', exp:'Past simple passive: was/were + past participle' },
    { id:'eg-m02', topic:'grammar', difficulty:'medium', q:'Reported speech: He said, "I am happy."', opts:['He said he was happy.','He said he is happy.','He told he was happy.','He says he was happy.'], ans:'He said he was happy.', exp:'Backshift in reported speech: am → was' },
    { id:'eg-m03', topic:'grammar', difficulty:'medium', q:'Identify tense: "By next year, I will have finished."', opts:['Future simple','Future continuous','Future perfect','Present perfect'], ans:'Future perfect', exp:'Will have + past participle = future perfect' },
    { id:'eg-m04', topic:'grammar', difficulty:'medium', q:'"Neither the boys nor the teacher ___ present."', opts:['were','are','was','be'], ans:'was', exp:'With neither...nor, verb agrees with nearer subject (teacher=singular)' },
    { id:'eg-m05', topic:'grammar', difficulty:'medium', q:'Choose correct: "I wish I ___ a bird."', opts:['am','was','were','be'], ans:'were', exp:'Subjunctive mood uses "were" for wishes/hypotheticals' },
    { id:'eg-m06', topic:'grammar', difficulty:'medium', q:'Identify: "The boy who won the prize is my friend."', opts:['Simple','Compound','Complex','Compound-Complex'], ans:'Complex', exp:'Contains a main clause + subordinate clause' },
    { id:'eg-m07', topic:'grammar', difficulty:'medium', q:'Correct conjunction: "___ she was tired, she finished the work."', opts:['Because','Although','Since','Unless'], ans:'Although', exp:'"Although" introduces a concessive clause (contrast)' },
    // Hard
    { id:'eg-h01', topic:'grammar', difficulty:'hard', q:'Which uses subjunctive correctly?', opts:["If I was you, I'd leave.","If I were you, I'd leave.","If I am you, I'd leave.","If I be you, I'd leave."], ans:"If I were you, I'd leave.", exp:'Subjunctive uses "were" for contrary-to-fact conditions' },
    { id:'eg-h02', topic:'grammar', difficulty:'hard', q:'"The man who called yesterday left no message." Clause type:', opts:['Noun clause','Adverb clause','Relative clause','Conditional'], ans:'Relative clause', exp:'"Who called yesterday" modifies "the man"' },
    { id:'eg-h03', topic:'grammar', difficulty:'hard', q:'Correct inversion after "Never":', opts:['Never I have seen this.','Never have I seen this.','Never seen have I this.','Never this I have seen.'], ans:'Never have I seen this.', exp:'Negative adverb at start → invert auxiliary and subject' },
    { id:'eg-h04', topic:'grammar', difficulty:'hard', q:'Which shows correct subject-verb agreement?', opts:['Either the students or the teacher are wrong.','Neither the manager nor the employees was present.','The committee have reached their decision.','A number of students was absent.'], ans:'Either the students or the teacher are wrong.', exp:'With either...or, verb agrees with the nearer subject' },

    // ── VOCABULARY ───────────────────────────────────────────
    // Easy
    { id:'ev-e01', topic:'vocabulary', difficulty:'easy', q:'"Benevolent" means:', opts:['Cruel','Kind and generous','Stubborn','Lazy'], ans:'Kind and generous', exp:'From Latin bene (well) + vole (wish)' },
    { id:'ev-e02', topic:'vocabulary', difficulty:'easy', q:'Antonym of "ancient":', opts:['Old','Modern','Wise','Broken'], ans:'Modern', exp:'Ancient = very old; modern = current, new' },
    { id:'ev-e03', topic:'vocabulary', difficulty:'easy', q:'Synonym of "happy":', opts:['Sad','Angry','Joyful','Tired'], ans:'Joyful', exp:'Joyful means feeling great happiness' },
    { id:'ev-e04', topic:'vocabulary', difficulty:'easy', q:'"Carnivore" means:', opts:['Plant eater','Meat eater','Fruit eater','Insect eater'], ans:'Meat eater', exp:'Latin: carne (meat) + vorare (to devour)' },
    { id:'ev-e05', topic:'vocabulary', difficulty:'easy', q:'Idiom: "Once in a blue moon" means:', opts:['Always','Never','Very rarely','Very often'], ans:'Very rarely', exp:'A blue moon is rare — means very infrequently' },
    { id:'ev-e06', topic:'vocabulary', difficulty:'easy', q:'Prefix "mis-" means:', opts:['Good','Before','Wrong','Again'], ans:'Wrong', exp:'Mis- = wrongly: misunderstand, mistake, mislead' },
    { id:'ev-e07', topic:'vocabulary', difficulty:'easy', q:'"Aqua" means:', opts:['Fire','Water','Earth','Air'], ans:'Water', exp:'Latin aqua = water (aquarium, aquatic)' },
    { id:'ev-e08', topic:'vocabulary', difficulty:'easy', q:'Antonym of "expand":', opts:['Grow','Widen','Contract','Extend'], ans:'Contract', exp:'Expand = grow larger; contract = grow smaller' },
    { id:'ev-e09', topic:'vocabulary', difficulty:'easy', q:'"Gigantic" means:', opts:['Tiny','Enormous','Ordinary','Beautiful'], ans:'Enormous', exp:'Gigantic = very large, like a giant' },
    { id:'ev-e10', topic:'vocabulary', difficulty:'easy', q:'Synonym of "brave":', opts:['Cowardly','Fearful','Courageous','Timid'], ans:'Courageous', exp:'Courageous = having courage, same as brave' },
    // Medium
    { id:'ev-m01', topic:'vocabulary', difficulty:'medium', q:'"Ephemeral" means:', opts:['Lasting forever','Short-lived','Very large','Very small'], ans:'Short-lived', exp:'From Greek ephemeros = lasting only a day' },
    { id:'ev-m02', topic:'vocabulary', difficulty:'medium', q:'Identify the oxymoron:', opts:['Cruel kindness','Brave warrior','Fast runner','Bright sunshine'], ans:'Cruel kindness', exp:'Oxymoron = contradictory words together' },
    { id:'ev-m03', topic:'vocabulary', difficulty:'medium', q:'"Gregarious" means:', opts:['Lonely','Sociable','Aggressive','Timid'], ans:'Sociable', exp:'From Latin grex (flock) — fond of company' },
    { id:'ev-m04', topic:'vocabulary', difficulty:'medium', q:'"Ameliorate" means:', opts:['To worsen','To improve','To confuse','To separate'], ans:'To improve', exp:'Ameliorate = to make something bad less severe' },
    { id:'ev-m05', topic:'vocabulary', difficulty:'medium', q:'Word meaning "very talkative":', opts:['Taciturn','Loquacious','Reticent','Laconic'], ans:'Loquacious', exp:'Loquacious: from Latin loqui = to speak' },
    { id:'ev-m06', topic:'vocabulary', difficulty:'medium', q:'Idiom: "Bite the bullet" means:', opts:['To eat something hard','To endure a painful situation','To shoot someone','To be very hungry'], ans:'To endure a painful situation', exp:'Historically, soldiers bit bullets during surgery without anaesthesia' },
    { id:'ev-m07', topic:'vocabulary', difficulty:'medium', q:'"Diligent" means:', opts:['Lazy','Careless','Hardworking','Reckless'], ans:'Hardworking', exp:'Diligent = showing care and effort in work' },
    // Hard
    { id:'ev-h01', topic:'vocabulary', difficulty:'hard', q:'"Perspicacious" means:', opts:['Sweaty','Sharp insight','Very talkative','Stubborn'], ans:'Sharp insight', exp:'From Latin perspicax = having keen sight; perceptive' },
    { id:'ev-h02', topic:'vocabulary', difficulty:'hard', q:'"Sycophant" refers to someone who:', opts:['Is honest','Is wise','Flatters to gain favour','Is courageous'], ans:'Flatters to gain favour', exp:'A sycophant uses excessive flattery for personal gain' },
    { id:'ev-h03', topic:'vocabulary', difficulty:'hard', q:'"Obsequious" means:', opts:['Rude','Excessively eager to please','Honest','Brave'], ans:'Excessively eager to please', exp:'Obsequious = too compliant, servile flattery' },
    { id:'ev-h04', topic:'vocabulary', difficulty:'hard', q:'"Laconic" means:', opts:['Very talkative','Using few words','Extremely happy','Very angry'], ans:'Using few words', exp:'From Sparta (Laconia) — famous for brief, pithy speech' },
  ],

  // ════════════════════════════════════════════════════════════
  // GK
  // ════════════════════════════════════════════════════════════
  gk: [

    // ── GEOGRAPHY ────────────────────────────────────────────
    // Easy
    { id:'gg-e01', topic:'geography', difficulty:'easy', q:'Capital of India?', opts:['Mumbai','Chennai','New Delhi','Kolkata'], ans:'New Delhi', exp:"New Delhi has been India's capital since 1911" },
    { id:'gg-e02', topic:'geography', difficulty:'easy', q:'Largest continent?', opts:['Africa','Asia','Europe','North America'], ans:'Asia', exp:'Asia covers ~44.6 million km²' },
    { id:'gg-e03', topic:'geography', difficulty:'easy', q:'Longest river in the world?', opts:['Amazon','Nile','Yangtze','Mississippi'], ans:'Nile', exp:'The Nile (6,650 km) flows through northeast Africa' },
    { id:'gg-e04', topic:'geography', difficulty:'easy', q:'Mount Everest is in which range?', opts:['Alps','Andes','Himalayas','Rockies'], ans:'Himalayas', exp:'Everest (8,849m) is the highest peak in the Himalayas' },
    { id:'gg-e05', topic:'geography', difficulty:'easy', q:'How many oceans are there?', opts:['3','4','5','6'], ans:'5', exp:'Pacific, Atlantic, Indian, Arctic, Southern' },
    { id:'gg-e06', topic:'geography', difficulty:'easy', q:'Sahara Desert is in which continent?', opts:['Asia','South America','Australia','Africa'], ans:'Africa', exp:"World's largest hot desert in North Africa" },
    { id:'gg-e07', topic:'geography', difficulty:'easy', q:'Which country has the Eiffel Tower?', opts:['Italy','Spain','Germany','France'], ans:'France', exp:'Eiffel Tower is in Paris, the capital of France' },
    { id:'gg-e08', topic:'geography', difficulty:'easy', q:'River flowing through Egypt:', opts:['Amazon','Congo','Nile','Ganges'], ans:'Nile', exp:'The Nile is the lifeline of Egypt' },
    { id:'gg-e09', topic:'geography', difficulty:'easy', q:'Smallest continent?', opts:['Europe','Antarctica','Australia','South America'], ans:'Australia', exp:'Australia is the smallest continent at ~7.7 million km²' },
    { id:'gg-e10', topic:'geography', difficulty:'easy', q:'The Great Wall is in which country?', opts:['Japan','India','China','Korea'], ans:'China', exp:'The Great Wall of China stretches over 21,000 km' },
    { id:'gg-e11', topic:'geography', difficulty:'easy', q:'Which is the largest ocean?', opts:['Atlantic','Indian','Arctic','Pacific'], ans:'Pacific', exp:'Pacific Ocean covers ~165 million km²' },
    { id:'gg-e12', topic:'geography', difficulty:'easy', q:'Which country is called the Land of the Rising Sun?', opts:['China','Korea','Japan','Thailand'], ans:'Japan', exp:'Japan is called this because it is east of mainland Asia, where the sun rises first' },
    // Medium
    { id:'gg-m01', topic:'geography', difficulty:'medium', q:'Country with the longest coastline?', opts:['USA','Australia','Canada','Russia'], ans:'Canada', exp:'Canada has the longest coastline at ~202,080 km' },
    { id:'gg-m02', topic:'geography', difficulty:'medium', q:'Country in both Europe and Asia?', opts:['Iran','Turkey','Iraq','Egypt'], ans:'Turkey', exp:'Turkey straddles both continents via the Bosphorus' },
    { id:'gg-m03', topic:'geography', difficulty:'medium', q:'Indian state with the longest coastline?', opts:['Kerala','Tamil Nadu','Gujarat','Maharashtra'], ans:'Gujarat', exp:'Gujarat has ~1,600 km of coastline' },
    { id:'gg-m04', topic:'geography', difficulty:'medium', q:'Tropic of Cancer passes through which part of India?', opts:['South','North','Central','East'], ans:'Central', exp:'Tropic of Cancer (23.5°N) passes through central India' },
    { id:'gg-m05', topic:'geography', difficulty:'medium', q:'Which river is known as "Sorrow of Bihar"?', opts:['Ganga','Yamuna','Kosi','Brahmaputra'], ans:'Kosi', exp:'Kosi river causes frequent devastating floods in Bihar' },
    { id:'gg-m06', topic:'geography', difficulty:'medium', q:'The Deccan Plateau is in which country?', opts:['China','Sri Lanka','Pakistan','India'], ans:'India', exp:'The Deccan Plateau covers most of peninsular India' },
    // Hard
    { id:'gg-h01', topic:'geography', difficulty:'hard', q:'Country with the most time zones?', opts:['USA','Russia','China','France'], ans:'France', exp:'France spans 12 time zones due to its overseas territories' },
    { id:'gg-h02', topic:'geography', difficulty:'hard', q:'Lake Baikal is in:', opts:['Kazakhstan','Mongolia','Russia','China'], ans:'Russia', exp:"Lake Baikal (Siberia) is the world's deepest lake at 1,642m" },
    { id:'gg-h03', topic:'geography', difficulty:'hard', q:'Strait of Malacca connects:', opts:['Red Sea and Arabian Sea','Pacific and Arctic','Indian Ocean and South China Sea','Baltic and North Sea'], ans:'Indian Ocean and South China Sea', exp:'Major shipping lane between Malay Peninsula and Sumatra' },
    { id:'gg-h04', topic:'geography', difficulty:'hard', q:'Which Indian river originates from Amarkantak?', opts:['Godavari','Narmada','Krishna','Tapti'], ans:'Narmada', exp:'Narmada originates from Amarkantak in Madhya Pradesh' },

    // ── CAPITALS ─────────────────────────────────────────────
    // Easy
    { id:'gc-e01', topic:'capitals', difficulty:'easy', q:'Capital of Japan?', opts:['Seoul','Beijing','Tokyo','Bangkok'], ans:'Tokyo', exp:"Tokyo has been Japan's capital since 1869" },
    { id:'gc-e02', topic:'capitals', difficulty:'easy', q:'Capital of France?', opts:['Berlin','Madrid','Paris','Rome'], ans:'Paris', exp:"Paris has been France's capital for over 1,000 years" },
    { id:'gc-e03', topic:'capitals', difficulty:'easy', q:'Capital of Australia?', opts:['Sydney','Melbourne','Brisbane','Canberra'], ans:'Canberra', exp:"Canberra, not Sydney, is Australia's capital" },
    { id:'gc-e04', topic:'capitals', difficulty:'easy', q:'Capital of China?', opts:['Shanghai','Guangzhou','Beijing','Shenzhen'], ans:'Beijing', exp:'Beijing means Northern Capital' },
    { id:'gc-e05', topic:'capitals', difficulty:'easy', q:'Capital of USA?', opts:['New York','Los Angeles','Washington D.C.','Chicago'], ans:'Washington D.C.', exp:'Washington D.C. (District of Columbia) is the US capital' },
    { id:'gc-e06', topic:'capitals', difficulty:'easy', q:'Capital of Germany?', opts:['Munich','Hamburg','Frankfurt','Berlin'], ans:'Berlin', exp:"Berlin has been Germany's capital since 1990 reunification" },
    { id:'gc-e07', topic:'capitals', difficulty:'easy', q:'Capital of Brazil?', opts:['São Paulo','Rio de Janeiro','Brasília','Salvador'], ans:'Brasília', exp:'Brasília replaced Rio as capital in 1960' },
    { id:'gc-e08', topic:'capitals', difficulty:'easy', q:'Capital of Russia?', opts:['St. Petersburg','Moscow','Kiev','Novosibirsk'], ans:'Moscow', exp:"Moscow has been Russia's capital since 1918" },
    { id:'gc-e09', topic:'capitals', difficulty:'easy', q:'Capital of Pakistan?', opts:['Karachi','Lahore','Islamabad','Peshawar'], ans:'Islamabad', exp:'Islamabad replaced Karachi as capital in 1966' },
    { id:'gc-e10', topic:'capitals', difficulty:'easy', q:'Capital of Italy?', opts:['Milan','Naples','Venice','Rome'], ans:'Rome', exp:"Rome, the Eternal City, is Italy's capital" },
    // Medium
    { id:'gc-m01', topic:'capitals', difficulty:'medium', q:'Capital of Canada?', opts:['Toronto','Vancouver','Ottawa','Montreal'], ans:'Ottawa', exp:"Ottawa, not Toronto, is Canada's capital" },
    { id:'gc-m02', topic:'capitals', difficulty:'medium', q:'Capital of UAE?', opts:['Dubai','Sharjah','Abu Dhabi','Ajman'], ans:'Abu Dhabi', exp:'Abu Dhabi is both the capital and largest emirate' },
    { id:'gc-m03', topic:'capitals', difficulty:'medium', q:'Capital of Argentina?', opts:['Buenos Aires','Córdoba','Rosario','Mendoza'], ans:'Buenos Aires', exp:'Buenos Aires means good airs/winds in Spanish' },
    { id:'gc-m04', topic:'capitals', difficulty:'medium', q:'Executive capital of South Africa?', opts:['Cape Town','Johannesburg','Pretoria','Durban'], ans:'Pretoria', exp:'South Africa has 3 capitals; Pretoria is executive capital' },
    { id:'gc-m05', topic:'capitals', difficulty:'medium', q:'Capital of Sri Lanka (legislative)?', opts:['Colombo','Kandy','Sri Jayawardenepura Kotte','Galle'], ans:'Sri Jayawardenepura Kotte', exp:'Sri Lanka has two capitals — legislative is Sri Jayawardenepura Kotte' },
    // Hard
    { id:'gc-h01', topic:'capitals', difficulty:'hard', q:'Highest capital city in the world?', opts:['Kathmandu','Quito','Thimphu','La Paz'], ans:'La Paz', exp:"La Paz (Bolivia) at ~3,640m — world's highest seat of government" },
    { id:'gc-h02', topic:'capitals', difficulty:'hard', q:'Capital of Myanmar?', opts:['Yangon','Mandalay','Naypyidaw','Bagan'], ans:'Naypyidaw', exp:'Naypyidaw replaced Yangon as capital in 2006' },
    { id:'gc-h03', topic:'capitals', difficulty:'hard', q:'Capital of Kazakhstan?', opts:['Almaty','Astana','Shymkent','Karaganda'], ans:'Astana', exp:'Astana (formerly Nur-Sultan) is the capital of Kazakhstan' },

    // ── SCIENCE GK ───────────────────────────────────────────
    // Easy
    { id:'gs-e01', topic:'science_gk', difficulty:'easy', q:'Nearest star to Earth?', opts:['Sirius','Proxima Centauri','Betelgeuse','The Sun'], ans:'The Sun', exp:'The Sun is our nearest star at ~150 million km' },
    { id:'gs-e02', topic:'science_gk', difficulty:'easy', q:'Chemical symbol of water?', opts:['WA','H2O','HO2','W'], ans:'H2O', exp:'Water = 2 Hydrogen + 1 Oxygen atoms' },
    { id:'gs-e03', topic:'science_gk', difficulty:'easy', q:'How many bones in adult human body?', opts:['106','206','306','406'], ans:'206', exp:'Adult humans have 206 bones' },
    { id:'gs-e04', topic:'science_gk', difficulty:'easy', q:'Largest planet in our solar system?', opts:['Saturn','Mars','Jupiter','Neptune'], ans:'Jupiter', exp:'Jupiter is the largest planet, 11x Earth diameter' },
    { id:'gs-e05', topic:'science_gk', difficulty:'easy', q:'Which gas do plants absorb for photosynthesis?', opts:['Oxygen','Nitrogen','Carbon dioxide','Hydrogen'], ans:'Carbon dioxide', exp:'Plants absorb CO₂ for photosynthesis' },
    { id:'gs-e06', topic:'science_gk', difficulty:'easy', q:'How many planets are in our solar system?', opts:['7','8','9','10'], ans:'8', exp:'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune' },
    { id:'gs-e07', topic:'science_gk', difficulty:'easy', q:'What is the chemical symbol for gold?', opts:['Go','Gd','Au','Ag'], ans:'Au', exp:'From Latin Aurum — Au is the symbol for gold' },
    { id:'gs-e08', topic:'science_gk', difficulty:'easy', q:'Which organ pumps blood through the body?', opts:['Liver','Kidney','Lungs','Heart'], ans:'Heart', exp:'The heart pumps blood through the circulatory system' },
    // Medium
    { id:'gs-m01', topic:'science_gk', difficulty:'medium', q:'pH of pure water?', opts:['5','6','7','8'], ans:'7', exp:'Pure water is neutral with pH = 7' },
    { id:'gs-m02', topic:'science_gk', difficulty:'medium', q:'Who invented the telephone?', opts:['Edison','Tesla','Bell','Marconi'], ans:'Bell', exp:'Alexander Graham Bell invented the telephone in 1876' },
    { id:'gs-m03', topic:'science_gk', difficulty:'medium', q:'Hardest natural substance?', opts:['Iron','Gold','Diamond','Quartz'], ans:'Diamond', exp:'Diamond rates 10 on the Mohs hardness scale' },
    { id:'gs-m04', topic:'science_gk', difficulty:'medium', q:'Which organ produces insulin?', opts:['Liver','Kidney','Pancreas','Heart'], ans:'Pancreas', exp:'The pancreas produces insulin to regulate blood sugar' },
    { id:'gs-m05', topic:'science_gk', difficulty:'medium', q:'Speed of light (approx)?', opts:['3×10⁴ km/s','3×10⁵ km/s','3×10⁶ km/s','3×10⁸ km/s'], ans:'3×10⁵ km/s', exp:'Speed of light ≈ 300,000 km/s = 3×10⁵ km/s' },
    { id:'gs-m06', topic:'science_gk', difficulty:'medium', q:'Which planet is known as the Red Planet?', opts:['Venus','Mars','Jupiter','Saturn'], ans:'Mars', exp:'Mars appears red due to iron oxide (rust) on its surface' },
    // Hard
    { id:'gs-h01', topic:'science_gk', difficulty:'hard', q:'What is the atomic number of Carbon?', opts:['4','6','8','12'], ans:'6', exp:'Carbon has 6 protons — atomic number = number of protons' },
    { id:'gs-h02', topic:'science_gk', difficulty:'hard', q:'Which scientist proposed the theory of relativity?', opts:['Newton','Darwin','Einstein','Hawking'], ans:'Einstein', exp:'Albert Einstein proposed Special and General Relativity' },
    { id:'gs-h03', topic:'science_gk', difficulty:'hard', q:'What is the powerhouse of the cell?', opts:['Nucleus','Ribosome','Mitochondria','Chloroplast'], ans:'Mitochondria', exp:'Mitochondria produce ATP — the energy currency of the cell' },
  ],

  // ════════════════════════════════════════════════════════════
  // REASONING
  // ════════════════════════════════════════════════════════════
  reasoning: [

    // ── NUMBER SERIES ─────────────────────────────────────────
    // Easy
    { id:'rn-e01', topic:'number_series', difficulty:'easy', q:'Find next: 2, 4, 6, 8, ___', opts:['9','10','11','12'], ans:'10', exp:'Even numbers — add 2 each time' },
    { id:'rn-e02', topic:'number_series', difficulty:'easy', q:'Find missing: 1, 4, 9, 16, ___, 36', opts:['20','24','25','30'], ans:'25', exp:'Perfect squares: 1², 2², 3², 4², 5², 6²' },
    { id:'rn-e03', topic:'number_series', difficulty:'easy', q:'Find next: 1, 2, 4, 8, ___', opts:['12','16','14','10'], ans:'16', exp:'Multiply by 2 each time (powers of 2)' },
    { id:'rn-e04', topic:'number_series', difficulty:'easy', q:'Odd one out: 2, 4, 6, 9, 10', opts:['2','4','9','10'], ans:'9', exp:'9 is odd; rest are even' },
    { id:'rn-e05', topic:'number_series', difficulty:'easy', q:'Find next: 100, 90, 80, 70, ___', opts:['55','60','65','50'], ans:'60', exp:'Subtract 10 each time' },
    { id:'rn-e06', topic:'number_series', difficulty:'easy', q:'Find next: 3, 6, 9, 12, ___', opts:['13','14','15','16'], ans:'15', exp:'Multiples of 3' },
    { id:'rn-e07', topic:'number_series', difficulty:'easy', q:'Find next: 5, 10, 15, 20, ___', opts:['22','24','25','30'], ans:'25', exp:'Multiples of 5' },
    { id:'rn-e08', topic:'number_series', difficulty:'easy', q:'Find next: 1, 3, 5, 7, ___', opts:['8','9','10','11'], ans:'9', exp:'Odd numbers — add 2 each time' },
    { id:'rn-e09', topic:'number_series', difficulty:'easy', q:'Odd one out: 4, 8, 12, 15, 20', opts:['4','8','15','20'], ans:'15', exp:'All others are multiples of 4; 15 is not' },
    { id:'rn-e10', topic:'number_series', difficulty:'easy', q:'Find next: 0, 5, 10, 15, ___', opts:['18','19','20','25'], ans:'20', exp:'Add 5 each time' },
    // Medium
    { id:'rn-m01', topic:'number_series', difficulty:'medium', q:'Find next: 3, 6, 11, 18, 27, ___', opts:['36','38','40','42'], ans:'38', exp:'Differences: 3,5,7,9,11. 27+11=38' },
    { id:'rn-m02', topic:'number_series', difficulty:'medium', q:'Find next: 1, 1, 2, 3, 5, 8, 13, ___', opts:['18','19','21','24'], ans:'21', exp:'Fibonacci: each = sum of two before. 8+13=21' },
    { id:'rn-m03', topic:'number_series', difficulty:'medium', q:'Find next: 144, 121, 100, 81, ___', opts:['64','68','72','60'], ans:'64', exp:'Descending perfect squares: 12²,11²,10²,9²,8²=64' },
    { id:'rn-m04', topic:'number_series', difficulty:'medium', q:'Find next: 2, 6, 12, 20, 30, ___', opts:['40','42','44','46'], ans:'42', exp:'n(n+1) pattern. Differences: 4,6,8,10,12. 30+12=42' },
    { id:'rn-m05', topic:'number_series', difficulty:'medium', q:'Find next: 1, 8, 27, 64, ___', opts:['100','121','125','150'], ans:'125', exp:'Cube numbers: 1³,2³,3³,4³,5³=125' },
    { id:'rn-m06', topic:'number_series', difficulty:'medium', q:'A class of 40: 25 play cricket, 20 football, 10 both. Neither?', opts:['3','5','7','10'], ans:'5', exp:'By inclusion-exclusion: 25+20−10=35; 40−35=5' },
    // Hard
    { id:'rn-h01', topic:'number_series', difficulty:'hard', q:'Find next: 2, 3, 5, 7, 11, 13, ___', opts:['15','17','19','21'], ans:'17', exp:'Prime numbers in sequence' },
    { id:'rn-h02', topic:'number_series', difficulty:'hard', q:'Find next: 1, 2, 6, 24, 120, ___', opts:['240','360','720','600'], ans:'720', exp:'Factorials: 1!,2!,3!,4!,5!,6!=720' },
    { id:'rn-h03', topic:'number_series', difficulty:'hard', q:'In how many ways can letters of LEVEL be arranged?', opts:['24','30','60','120'], ans:'30', exp:'5!/(2!×2!) = 120/4 = 30 (L repeats twice, E repeats twice)' },

    // ── LOGICAL ──────────────────────────────────────────────
    // Easy
    { id:'rl-e01', topic:'logical', difficulty:'easy', q:'Rahul taller than Priya. Priya taller than Anjali. Shortest?', opts:['Rahul','Priya','Anjali','Cannot say'], ans:'Anjali', exp:'Rahul > Priya > Anjali, so Anjali is shortest' },
    { id:'rl-e02', topic:'logical', difficulty:'easy', q:'Today is Monday. Day after 100 days?', opts:['Monday','Tuesday','Wednesday','Thursday'], ans:'Wednesday', exp:'100 = 14×7 + 2; Monday + 2 = Wednesday' },
    { id:'rl-e03', topic:'logical', difficulty:'easy', q:'Analogy: Book : Author :: Painting : ___', opts:['Museum','Canvas','Artist','Brush'], ans:'Artist', exp:'A book is created by an author; a painting by an artist' },
    { id:'rl-e04', topic:'logical', difficulty:'easy', q:'Odd one out: Cow, Goat, Tiger, Sheep', opts:['Cow','Goat','Tiger','Sheep'], ans:'Tiger', exp:'Cow, Goat, Sheep are herbivores; Tiger is carnivore' },
    { id:'rl-e05', topic:'logical', difficulty:'easy', q:'Man walks 3km North, then 4km East. Distance from start?', opts:['3 km','4 km','5 km','7 km'], ans:'5 km', exp:'Pythagoras: √(3²+4²) = 5 km' },
    { id:'rl-e06', topic:'logical', difficulty:'easy', q:'Which letter looks same in a mirror?', opts:['F','P','A','L'], ans:'A', exp:'A is symmetric about its vertical axis' },
    { id:'rl-e07', topic:'logical', difficulty:'easy', q:'Analogy: Fish : Water :: Bird : ___', opts:['Nest','Sky','Tree','Air'], ans:'Sky', exp:'Fish lives in water; bird lives in sky' },
    { id:'rl-e08', topic:'logical', difficulty:'easy', q:'Doctor : Hospital :: Teacher : ___', opts:['Book','Student','School','Chalk'], ans:'School', exp:'Doctor works in hospital; teacher works in school' },
    { id:'rl-e09', topic:'logical', difficulty:'easy', q:'All roses are flowers. Some flowers fade. Therefore:', opts:['All roses fade','Some roses may fade','No roses fade','Cannot say'], ans:'Some roses may fade', exp:'We cannot conclude all roses fade, but some might' },
    { id:'rl-e10', topic:'logical', difficulty:'easy', q:'Odd one out: Square, Circle, Triangle, Cube', opts:['Square','Circle','Triangle','Cube'], ans:'Cube', exp:'Square, Circle, Triangle are 2D shapes; Cube is 3D' },
    // Medium
    { id:'rl-m01', topic:'logical', difficulty:'medium', q:'Bat and ball cost ₹110. Bat costs ₹100 more than ball. Ball costs:', opts:['₹5','₹10','₹15','₹20'], ans:'₹5', exp:'Let ball=x; bat=x+100. x+x+100=110 → x=5' },
    { id:'rl-m02', topic:'logical', difficulty:'medium', q:'4 machines make 4 widgets in 4 min. 100 machines → 100 widgets in?', opts:['1 min','4 min','100 min','400 min'], ans:'4 min', exp:'1 machine makes 1 widget in 4 min; 100 machines still need 4 min' },
    { id:'rl-m03', topic:'logical', difficulty:'medium', q:'3 friends split ₹1200 in ratio 2:3:5. Largest share?', opts:['₹240','₹360','₹600','₹480'], ans:'₹600', exp:'Total parts=10; largest=5 parts = 600' },
    { id:'rl-m04', topic:'logical', difficulty:'medium', q:'A is 2 yrs older than B who is twice as old as C. Total=27. Age of B?', opts:['6','8','10','12'], ans:'10', exp:'C=x, B=2x, A=2x+2; 5x+2=27, x=5, B=10' },
    { id:'rl-m05', topic:'logical', difficulty:'medium', q:'All A are B. No B is C. Therefore:', opts:['Some A are C','No A is C','Some C are A','All B are A'], ans:'No A is C', exp:'All A⊂B; B∩C=∅; therefore A∩C=∅' },
    { id:'rl-m06', topic:'logical', difficulty:'medium', q:'Clock shows 3:15. Angle between hour and minute hands?', opts:['0°','7.5°','90°','97.5°'], ans:'7.5°', exp:'Hour hand at 3:15 = 97.5°; minute hand = 90°; difference = 7.5°' },
    { id:'rl-m07', topic:'logical', difficulty:'medium', q:'If ROSE = 6251 and DOOR = 4556, then RODE = ?', opts:['6514','6541','6254','6245'], ans:'6541', exp:'R=6, O=5, D=4, E=1. RODE = 6541' },
    // Hard
    { id:'rl-h01', topic:'logical', difficulty:'hard', q:'A farmer has 17 sheep. All but 9 die. How many left?', opts:['8','9','17','None'], ans:'9', exp:'"All but 9" means 9 survive' },
    { id:'rl-h02', topic:'logical', difficulty:'hard', q:'You overtake 2nd place in a race. Your position?', opts:['1st','2nd','3rd','Depends'], ans:'2nd', exp:"You take their place — 2nd. You didn't pass 1st." },
    { id:'rl-h03', topic:'logical', difficulty:'hard', q:'5 people build 5 houses in 5 days. 100 houses in 100 days needs:', opts:['5','20','100','500'], ans:'5', exp:'1 person builds 1 house in 5 days; in 100 days builds 20; 5 people build 100' },
    { id:'rl-h04', topic:'logical', difficulty:'hard', q:'3 boxes (apples/oranges/both), all mislabelled. Pick from "Both" box → apple. "Oranges" box has:', opts:['Apples','Oranges','Both','Cannot say'], ans:'Both', exp:'"Both" box has only apples. "Apples" has oranges. "Oranges" must have Both.' },
    { id:'rl-h05', topic:'logical', difficulty:'hard', q:'Two hourglasses: 4 min and 7 min. How to measure exactly 9 minutes?', opts:['Start both, flip 4-min when done','Start 7-min, start 4-min when 7 ends','Start both, when 4-min ends flip it; when 7-min ends flip 4-min','Cannot be done'], ans:'Start both, when 4-min ends flip it; when 7-min ends flip 4-min', exp:'At 4min flip 4-hourglass; at 7min flip it again; runs 1 more min = 9 total' },
  ],
};

// Helper functions
export function getQuestionsForSubject(subject) {
  return QB[subject] || [];
}

export function getQuestionsByTopicAndDifficulty(subject, topic, difficulty) {
  return (QB[subject] || []).filter(q => q.topic === topic && q.difficulty === difficulty);
}

export function getTotalCount() {
  return Object.values(QB).reduce((total, qs) => total + qs.length, 0);
}
