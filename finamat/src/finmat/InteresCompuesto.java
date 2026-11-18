package src.finmat;

import java.util.ArrayList;
import java.util.List;

public class InteresCompuesto {

    public record Fila(int periodo, double interes, double interesAcumulado, double monto) {}

    private static void validar(double capital, double tasaAnual, double anios, int n) {
        if (capital <= 0) throw new IllegalArgumentException("El capital debe ser mayor a 0");
        if (tasaAnual < 0) throw new IllegalArgumentException("La tasa no puede ser negativa");
        if (anios <= 0) throw new IllegalArgumentException("El tiempo debe ser mayor a 0");
        if (n <= 0) throw new IllegalArgumentException("Las capitalizaciones por año deben ser mayores a 0");
    }

    // M = C * (1 + i/n)^(n*t)
    // n: capitalizaciones por año (1 anual, 2 semestral, 4 trimestral, 12 mensual, 365 diaria)
    public static double monto(double capital, double tasaAnual, double anios, int n) {
        validar(capital, tasaAnual, anios, n);
        double i = (tasaAnual / 100) / n;
        return capital * Math.pow(1 + i, n * anios);
    }

    public static double interes(double capital, double tasaAnual, double anios, int n) {
        return monto(capital, tasaAnual, anios, n) - capital;
    }

    // Desglose año por año
    public static List<Fila> desglose(double capital, double tasaAnual, int anios, int n) {
        validar(capital, tasaAnual, anios, n);
        List<Fila> filas = new ArrayList<>();
        double montoAnterior = capital;
        for (int a = 1; a <= anios; a++) {
            double montoActual = monto(capital, tasaAnual, a, n);
            filas.add(new Fila(a, montoActual - montoAnterior, montoActual - capital, montoActual));
            montoAnterior = montoActual;
        }
        return filas;
    }
} 
    

