System length;  L = 2m
Radius of gyration; i = 1.11cm
Yield stress;   fy = 355N/mm²
Effective length factor;	k = 1
Effective length; 	Le = L*k	=2.0 m
Critical buckling force;	Ncr = (pi)2*E*Iy / Le²	=23 kN
Slenderness ratio for torsional buckling - eq 6.50;	λ = sqrt(A*fy / Ncr)	=2.14
Slenderness ratio for flexural buckling - eq 6.50;	λ = Le/(93.9*i*sqrt(235/355))	=1.70

Imperfection factor - Table 6.1;	α = 0.49
Buckling reduction determination factor;	φ = 0.5*(1 + α * (λ  - 0.2) + λ²) 	=2.31
Buckling reduction factor - eq 6.49;	χ = min(1 / (φ + sqrt(φ² - λ²)), 1) 	=0.26

Design buckling resistance - eq 6.47;	Nbrd = χ* A* fy /γM1	=26.90 kN
Utilisation;	U = Ned/Nbrd	=1.00
