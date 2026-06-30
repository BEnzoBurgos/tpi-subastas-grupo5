const moneyFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(amount) {
  if (amount == null) return '$0,00'
  return '$' + moneyFormatter.format(amount)
}
