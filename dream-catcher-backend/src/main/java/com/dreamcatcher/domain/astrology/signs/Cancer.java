package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.WaterSign;

public final class Cancer extends WaterSign {
    public Cancer() { super("Cancer", "♋", 6, 21, 7, 22); }
    @Override public Modality getModality()    { return Modality.CARDINAL; }
    @Override public String getLuckyColor()    { return "Silver"; }
    @Override public String getRulingPlanet()  { return "Moon"; }
}
