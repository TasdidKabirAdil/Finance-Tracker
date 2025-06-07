export async function handleReportAcknowledge(reportData, ack, targetMonth) {
  if (reportData?.monthlyReport && reportData.monthlyReport.acknowledged === false) {
    alert(`Your monthly report for ${targetMonth} is available`);

    try {
      await ack({
        variables: {
          updateAcknowledgeId: reportData.monthlyReport.id,
          acknowledged: true
        }
      });
    } catch (err) {
      console.error("Failed to acknowledge report:", err);
    }
  }
}