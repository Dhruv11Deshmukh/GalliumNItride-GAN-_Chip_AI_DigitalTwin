# AI-Based Digital Twin for GaN Chip

An intelligent Digital Twin framework for **Gallium Nitride (GaN) Power Semiconductor Devices** that combines **Machine Learning + Physics-Based Modeling** to predict real-time device behavior under varying operating conditions.

This project focuses on accurate prediction of **Drain-Source Current (IDS)** based on:

- Drain-Source Voltage (VDS)
- Junction Temperature
- Switching Frequency

The system is designed for next-generation applications such as:

- Electric Vehicles (EVs)
- Renewable Energy Systems
- Data Centers
- High-Frequency Power Electronics
- Smart Predictive Maintenance

---

## Project Overview

GaN power devices outperform traditional Silicon devices due to:

- Faster switching speed
- Higher breakdown voltage
- Better thermal efficiency
- Higher electron mobility

However, they suffer from nonlinear effects such as:

- Dynamic ON resistance (RDS(on))
- Self-heating
- Trap-induced current collapse

Traditional simulation methods like TCAD are computationally expensive.

This project solves that using an **AI-powered Digital Twin** capable of:

- Real-time prediction
- Fast inference
- Hybrid intelligence
- Better reliability estimation
- Interactive visualization

---

## Core Technology Stack

### Machine Learning
- Multi Layer Perceptron (MLP Regressor)

### Physics Modeling
- Resistance-based IDS estimator

### Backend
- FastAPI

### Frontend
- HTML / CSS / JavaScript Dashboard

### Data Processing
- NumPy
- Pandas
- Scikit-learn

---

## Hybrid Model Architecture

Final prediction is generated using:

Prediction = Weighted Average of:

- AI Model Output
- Physics-Based Output

This gives:

Better Accuracy  
Better Generalization  
Physically Realistic Results  
Reduced Overfitting  

---

## Inputs

User provides:

| Parameter | Description |
|---------|-------------|
| VDS | Drain Source Voltage |
| Temp | Junction Temperature |
| Freq | Switching Frequency |

---

## Output

Predicted:

- IDS (Drain Source Current)

With:

- Real-time graphing
- Characteristic curves
- Operating region analysis
- Thermal trend visualization

---

## Project Pipeline

1. Synthetic bounded-response dataset generation  
2. Data preprocessing & scaling  
3. MLP training  
4. Physics model integration  
5. Hybrid fusion model  
6. FastAPI deployment  
7. Web dashboard visualization  

---

## Performance

| Metric | Hybrid Model |
|------|--------------|
| R² Score | 0.9936 |
| RMSE | 355.52 |
| MAE | 245.36 |

---

## Real World Applications

- EV Power Modules
- Smart Chargers
- Inverters
- Semiconductor Reliability Monitoring
- Predictive Maintenance
- Design Optimization

---

## Future Scope

- Real hardware sensor integration
- LSTM temporal degradation prediction
- Physics Informed Neural Networks (PINNs)
- Edge AI deployment
- Autonomous decision agents
- Semiconductor manufacturing analytics

---
