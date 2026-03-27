package com.dreamcatcher.domain.astrology;

public abstract class ZodiacSign {

    public enum Element { FIRE, WATER, EARTH, AIR }
    public enum Modality { CARDINAL, FIXED, MUTABLE }

    private final String name;
    private final String symbol;
    private final int startMonth;
    private final int startDay;
    private final int endMonth;
    private final int endDay;

    protected ZodiacSign(String name, String symbol,
                         int startMonth, int startDay,
                         int endMonth, int endDay) {
        this.name = name;
        this.symbol = symbol;
        this.startMonth = startMonth;
        this.startDay = startDay;
        this.endMonth = endMonth;
        this.endDay = endDay;
    }

    public abstract Element getElement();
    public abstract Modality getModality();
    public abstract String getLuckyColor();
    public abstract String getRulingPlanet();

    public String getSleepInsight() {
        return "Ogólna tendencja dla " + name + ": wpływ planet na jakość snu.";
    }

    public String getName()     { return name; }
    public String getSymbol()   { return symbol; }
    public int getStartMonth()  { return startMonth; }
    public int getStartDay()    { return startDay; }
    public int getEndMonth()    { return endMonth; }
    public int getEndDay()      { return endDay; }
}
