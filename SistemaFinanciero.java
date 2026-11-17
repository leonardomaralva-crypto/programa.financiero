import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class SistemaFinanciero {

    // Clase auxiliar para estructurar las filas de la tabla de amortización
    public static class FilaAmortizacion {
        public int periodo;
        public double cuota;
        public double interes;
        public double amortizacion;
        public double saldoInsoluto;

        public FilaAmortizacion(int periodo, double cuota, double interes, double amortizacion, double saldoInsoluto) {
            this.periodo = periodo;
            this.cuota = cuota;
            this.interes = interes;
            this.amortizacion = amortizacion;
            this.saldoInsoluto = saldoInsoluto;
        }
    }

    // ==========================================
    // 1. ANUALIDADES VENCIDAS
    // ==========================================
    public static double valorFuturoVencida(double R, double i, int n) {
        if (i == 0) return R * n;
        return R * (Math.pow(1 + i, n) - 1) / i;
    }

    public static double valorPresenteVencida(double R, double i, int n) {
        if (i == 0) return R * n;
        return R * (1 - Math.pow(1 + i, -n)) / i;
    }

    // ==========================================
    // 2. ANUALIDADES ANTICIPADAS
    // ==========================================
    public static double valorFuturoAnticipada(double R, double i, int n) {
        if (i == 0) return R * n;
        return (R * (Math.pow(1 + i, n) - 1) / i) * (1 + i);
    }

    public static double valorPresenteAnticipada(double R, double i, int n) {
        if (i == 0) return R * n;
        return (R * (1 - Math.pow(1 + i, -n)) / i) * (1 + i);
    }

    // ==========================================
    // 3. CÁLCULO DE LA RENTA (PAGO PERIÓDICO)
    // ==========================================
    public static double rentaDesdeValorPresente(double VP, double i, int n) {
        if (i == 0) return VP / n;
        return VP * (i / (1 - Math.pow(1 + i, -n)));
    }

    public static double rentaDesdeValorFuturo(double VF, double i, int n) {
        if (i == 0) return VF / n;
        return VF * (i / (Math.pow(1 + i, n) - 1));
    }

    // ==========================================
    // 4. TABLA DE AMORTIZACIÓN (Sistema Francés)
    // ==========================================
    public static List<FilaAmortizacion> generarTablaAmortizacion(double montoPrestamo, double tasaInteresAnual, int plazoMeses) {
        double i = (tasaInteresAnual / 100.0) / 12.0;
        int n = plazoMeses;
        double cuota;

        if (i == 0) {
            cuota = montoPrestamo / n;
        } else {
            cuota = montoPrestamo * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        }

        double saldoInsoluto = montoPrestamo;
        List<FilaAmortizacion> tabla = new ArrayList<>();

        for (int periodo = 1; periodo <= n; periodo++) {
            double interes = saldoInsoluto * i;
            double amortizacion = cuota - interes;
            saldoInsoluto -= amortizacion;

            // Ajuste por errores de redondeo en el último centavo
            if (periodo == n && Math.abs(saldoInsoluto) < 1e-2) {
                saldoInsoluto = 0.0;
            }

            tabla.add(new FilaAmortizacion(
                periodo,
                Math.round(cuota * 100.0) / 100.0,
                Math.round(interes * 100.0) / 100.0,
                Math.round(amortizacion * 100.0) / 100.0,
                Math.round(Math.max(0.0, saldoInsoluto) * 100.0) / 100.0
            ));
        }

        return tabla;
    }

    // ==========================================
    // MENÚ PRINCIPAL INTERACTIVO
    // ==========================================
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int opcion = 0;

        do {
            System.out.println("\n========================================");
            System.out.println("   SISTEMA FINANCIERO - JAVA (IT)       ");
            System.out.println("========================================");
            System.out.println("1. Generar Tabla de Amortización (Créditos)");
            System.out.println("2. Calcular Valor Presente / Futuro (Anualidades)");
            System.out.println("3. Calcular Renta / Pago Periódico");
            System.out.println("4. Salir");
            System.out.print("Selecciona una opción: ");

            if (scanner.hasNextInt()) {
                opcion = scanner.nextInt();
            } else {
                System.out.println("Por favor, introduce un número válido.");
                scanner.next();
                continue;
            }

            switch (opcion) {
                case 1:
                    System.out.print("\nIngrese el monto del préstamo ($): ");
                    double monto = scanner.nextDouble();
                    System.out.print("Ingrese la tasa de interés anual (%): ");
                    double tasa = scanner.nextDouble();
                    System.out.print("Ingrese el plazo en meses: ");
                    int plazo = scanner.nextInt();

                    List<FilaAmortizacion> tabla = generarTablaAmortizacion(monto, tasa, plazo);
                    System.out.println("\n--- TABLA DE AMORTIZACIÓN ---");
                    System.out.printf("%-8s | %-12s | %-12s | %-14s | %-15s\n", "Periodo", "Cuota", "Interés", "Amortización", "Saldo Insoluto");
                    System.out.println("--------------------------------------------------------------------------");

                    double totalPagado = 0;
                    double totalInteres = 0;
                    for (FilaAmortizacion fila : tabla) {
                        System.out.printf("%-8d | $%-11.2f | $%-11.2f | $%-13.2f | $%-14.2f\n",
                                fila.periodo, fila.cuota, fila.interes, fila.amortizacion, fila.saldoInsoluto);
                        totalPagado += fila.cuota;
                        totalInteres += fila.interes;
                    }
                    System.out.println("--------------------------------------------------------------------------");
                    System.out.printf("Total a Pagar: $%.2f | Total de Intereses: $%.2f\n", totalPagado, totalInteres);
                    break;

                case 2:
                    System.out.println("\n1. Anualidad Vencida\n2. Anualidad Anticipada");
                    System.out.print("Seleccione el tipo de anualidad: ");
                    int tipoA = scanner.nextInt();

                    System.out.println("\n1. Valor Presente (VP)\n2. Valor Futuro (VF)");
                    System.out.print("¿Qué desea calcular?: ");
                    int tipoC = scanner.nextInt();

                    System.out.print("Ingrese la renta o pago periódico ($): ");
                    double renta = scanner.nextDouble();
                    System.out.print("Ingrese la tasa de interés anual (%): ");
                    double tasaAnual = scanner.nextDouble();
                    double iPeriodo = (tasaAnual / 100.0) / 12.0;
                    System.out.print("Ingrese el número de periodos (meses): ");
                    int nPeriodos = scanner.nextInt();

                    double resultado = 0;
                    if (tipoC == 1) { // VP
                        if (tipoA == 1) resultado = valorPresenteVencida(renta, iPeriodo, nPeriodos);
                        else resultado = valorPresenteAnticipada(renta, iPeriodo, nPeriodos);
                        System.out.printf("\nValor Presente Total: $%.2f\n", resultado);
                    } else { // VF
                        if (tipoA == 1) resultado = valorFuturoVencida(renta, iPeriodo, nPeriodos);
                        else resultado = valorFuturoAnticipada(renta, iPeriodo, nPeriodos);
                        System.out.printf("\nValor Futuro Total: $%.2f\n", resultado);
                    }
                    break;

                case 3:
                    System.out.println("\n1. Basado en Valor Presente (Ej. Préstamo)");
                    System.out.println("2. Basado en Valor Futuro (Ej. Meta de Ahorro)");
                    System.out.print("Seleccione una opción: ");
                    int modoRenta = scanner.nextInt();

                    System.out.print("Ingrese el monto base ($): ");
                    double montoBase = scanner.nextDouble();
                    System.out.print("Ingrese la tasa de interés anual (%): ");
                    double tasaR = scanner.nextDouble();
                    double iR = (tasaR / 100.0) / 12.0;
                    System.out.print("Ingrese el plazo en periodos: ");
                    int nR = scanner.nextInt();

                    double rentaCalc = 0;
                    if (modoRenta == 1) {
                        rentaCalc = rentaDesdeValorPresente(montoBase, iR, nR);
                    } else {
                        rentaCalc = rentaDesdeValorFuturo(montoBase, iR, nR);
                    }
                    System.out.printf("\nRenta o Pago Periódico Requerido: $%.2f\n", rentaCalc);
                    break;

                case 4:
                    System.out.println("¡Saliendo del programa. Hasta luego!");
                    break;

                default:
                    System.out.println("Opción inválida. Intente de nuevo.");
            }
        } while (opcion != 4);

        scanner.close();
    }
}