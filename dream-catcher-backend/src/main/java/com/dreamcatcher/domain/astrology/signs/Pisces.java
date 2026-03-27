package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.WaterSign;

public final class Pisces extends WaterSign {
    public Pisces() { super("Pisces", "♓", 2, 19, 3, 20); }
    @Override public Modality getModality()    { return Modality.MUTABLE; }
    @Override public String getLuckyColor()    { return "Sea Green"; }
    @Override public String getRulingPlanet()  { return "Neptune"; }
}
