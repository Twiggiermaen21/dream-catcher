package com.dreamcatcher.domain.astrology;

public abstract class WaterSign extends ZodiacSign {

    protected WaterSign(String name, String symbol,
                        int startMonth, int startDay,
                        int endMonth, int endDay) {
        super(name, symbol, startMonth, startDay, endMonth, endDay);
    }

    @Override
    public Element getElement() { return Element.WATER; }

    @Override
    public String getSleepInsight() {
        return "Znaki wody są wyjątkowo wrażliwe na fazy księżyca. " +
               "Podczas pełni księżyca sny są intensywniejsze i bardziej emocjonalne.";
    }
}
