package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.WaterSign;

public final class Scorpio extends WaterSign {
    public Scorpio() { super("Scorpio", "♏", 10, 23, 11, 21); }
    @Override public Modality getModality()    { return Modality.FIXED; }
    @Override public String getLuckyColor()    { return "Deep Red"; }
    @Override public String getRulingPlanet()  { return "Pluto"; }
}
