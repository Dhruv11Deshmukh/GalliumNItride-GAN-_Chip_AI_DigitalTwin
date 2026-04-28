def physics_estimate(vds: float, temp: float, freq: float) -> float:
    """
    Lightweight physics-inspired estimate used for hybrid blending.
    """
    rds_on = 0.01 + 0.0001 * temp + 1e-7 * freq
    ids = vds / max(rds_on, 1e-6)
    return float(ids)