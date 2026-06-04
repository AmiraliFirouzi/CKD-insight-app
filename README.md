# Chronic Kidney Disease Classification 🩺

> **Interactive Diagnostic Classification Panel using Linear Discriminant Analysis (LDA), Quadratic Discriminant Analysis (QDA), and Logistic Regression.**
> Designed by **Amirali Firouzi**

---

## 🌟 Overview
This repository contains a professional statistical modeling and classification project focused on classifying **Chronic Kidney Disease (CKD)**. Early detection of CKD using standard clinical clinical markers decreases diagnostic cost and time, and can prevent irreversible damage. 

This repository includes:
1. **Interactive R Markdown Document (`ckd_classification.Rmd`)** compiled into a standalone, polished HTML page featuring professional typography, smooth dynamic layouts, and integrated plots.
2. **Interactive Shiny Predictive Application** embedded directly inside the document, allowing real-time clinical parameter diagnostics using maximum-likelihood regularization.
3. **Interactive React/TypeScript Presentation Panel** (provided in this repository's web development setup) running an elegant, lightweight version of the metrics panel, dataset exploratory plots, and classification calculator.

---

## 📁 Repository Structure
```bash
├── README.md                      # Professional project documentation (this file)
├── r_project/                     # Core R & Rmd execution workspace
│   ├── ckd_classification.Rmd     # Polished Rmd document with embedded Shiny app
│   └── data/
│       └── kidney_disease.csv     # Cleaned Chronic Kidney Disease dataset
├── src/                           # Live React Dashboard files
│   ├── App.tsx                    # Main metrics and interactive dashboard UI
│   ├── index.css                  # Tailwinds design styling configurations
│   └── main.tsx                   # React entry-point
├── package.json                   # Web application dependencies
└── vite.config.ts                 # Dev build architecture configurations
```

---

## 🧪 Scientific Methodology & Classification Models
To capture complex, high-dimensional biological markers, we train and compare three distinct classical machine learning algorithms:

### 1. L1-Regularized Logistic Regression
Estimates the conditional probability of disease using a maximum likelihood lasso regularization:
$$\log\left(\frac{P(Y=1 \mid \mathbf{X})}{1 - P(Y=1 \mid \mathbf{X})}\right) = \beta_0 + \sum_{j=1}^{p} \beta_j X_j$$
- **Benefit**: Feature selection via sparse L1 penalties (zeroing out uninformative/redundant features) and precise clinical risk coefficient interpretation.

### 2. Linear Discriminant Analysis (LDA)
Models class-conditional distributions as multivariate normals sharing a common covariance matrix ($\mathbf{\Sigma}_k = \mathbf{\Sigma}$):
$$X \mid Y=k \sim \mathcal{N}(\mu_k,\, \mathbf{\Sigma})$$
- **Benefit**: Extremely stable decision boundaries for smaller datasets when the normality assumption holds.

### 3. Regularized Quadratic Discriminant Analysis (QDA)
Relaxes the equal covariance assumption, computing individual quadratic separation covariance matrices ($\mathbf{\Sigma}_k$):
$$X \mid Y=k \sim \mathcal{N}(\mu_k,\, \mathbf{\Sigma}_k)$$
- **Benefit**: Fits complex curved decision boundaries. We regularize this model (shrink towards pooled covariance) to prevent diagnostic variance scaling on sparse class records.

---

## 📊 Performance Indicators

Summary of diagnostic capabilities evaluated on the hold-out testing partition (30% random stratified split):

| Classification Model | Accuracy | Sensitivity (Recall) | Specificity | AUC-ROCScore |
| :--- | :---: | :---: | :---: | :---: |
| **L1-Logistic Regression** | **95.9%** | **97.8%** | **94.7%** | **0.979** |
| **Linear Discriminant Analysis (LDA)** | 92.6% | 97.8% | 89.3% | 0.971 |
| **Regularized QDA** | 95.0% | 97.8% | 93.3% | 0.980 |

---

## ⚙️ Quick Start guide

### Running the R Markdown File
To run the R Markdown modeling pipeline and access the embedded interactive Shiny risk calculator:

1. **Install R / RStudio** (version 4.1+ recommended).
2. Clone this repository to your local system:
   ```bash
   git clone https://github.com/heroesmihan/ckd_classification_panel.git
   cd ckd_classification_panel/r_project
   ```
3. Open R / RStudio and install the necessary dependencies:
   ```R
   install.packages(c("tidyverse", "tidymodels", "janitor", "shiny", "knitr", 
                      "kableExtra", "rsample", "recipes", "DT", "skimr", 
                      "corrplot", "themis", "embed", "discrim", "MASS", 
                      "klaR", "yardstick", "pROC", "glmnet", "gridExtra"))
   ```
4. Render (`knit`) the file:
   - In RStudio, open `ckd_classification.Rmd` and click the **Run Document** or **Knit** button.
   - Alternatively, execute this in your R console:
     ```R
     rmarkdown::run("ckd_classification.Rmd")
     ```

---

## 🧬 Diagnostic Feature Impact
Coefficients extracted from L1-Regularized Logistic Regression identify the main biomarkers predicting CKD:
- 🔴 **Serum Creatinine (sc) & Blood Urea (bu)**: Positive correlation. Elevating values directly indicates kidney filtration decay and robust risk enhancement.
- 🔴 **Hypertension & Diabetes**: Categorical indicators with high hazard scores.
- 🔵 **Hemoglobin (hemo)**: Negative correlation. Healthy red-blood cellular delivery profiles indicate sound protective rates against disease development.

---

## 📜 License
This project is shared under the Apache-2.0 License. See the full source parameters for copy permissions. Designed with 🩸 for statistical clinical diagnostics research. Feel free to fork, open issues, and contribute! 

*For educational and clinical research purposes only. Diagnostic outcomes should always be cross-verified by licensed nephrologists.*
