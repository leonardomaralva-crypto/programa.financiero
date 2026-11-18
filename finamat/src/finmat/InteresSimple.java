package src.finmat;

import java.util.ArrayList;
import java.util.List;

public class InteresSimple {

    public record Fila(int periodo, double interes, double interesAcumulado, double monto) {}

    private static void validar(double capital, double tasaAnual, double anios) {
        if (capital <= 0) throw new IllegalArgumentException("El capital debe ser mayor a 0");
        if (tasaAnual < 0) throw new IllegalArgumentException("La tasa no puede ser negativa");
        if (anios <= 0) throw new IllegalArgumentException("El tiempo debe ser mayor a 0");
    }

    // I = C * i * t (la tasa llega en porcentaje, por ejemplo 8)
    public static double interes(double capital, double tasaAnual, double anios) {
        validar(capital, tasaAnual, anios);
        return capital * (tasaAnual / 100) * anios;
    }

    // M = C + I
    public static double monto(double capital, double tasaAnual, double anios) {
        return capital + interes(capital, tasaAnual, anios);
    }

    // Desglose año por año (en interés simple el interés anual es constante)
    public static List<Fila> desglose(double capital, double tasaAnual, int anios) {
        validar(capital, tasaAnual, anios);
        List<Fila> filas = new ArrayList<>();
        double interesAnual = capital * (tasaAnual / 100);
        double acumulado = 0;
        for (int a = 1; a <= anios; a++) {
            acumulado += interesAnual;
            filas.add(new Fila(a, interesAnual, acumulado, capital + acumulado));
        }
        return filas;
    }
} 
