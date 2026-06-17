const fs = require('fs');
let lines = fs.readFileSync('client/src/pages/Bookings.tsx', 'utf8').split('\n');
let result = [];
let inserted = false;
for (let i = 0; i < lines.length; i++) {
  result.push(lines[i]);
  if (!inserted && lines[i].includes('{showRebookButton &&') ) {
    let j = i + 1;
    while (j < lines.length && !lines[j].includes('</Button>')) j++;
    while (i <= j) { result.push(lines[++i]); }
    const newButtons = [
'',
'                        {showAcceptButton && (',
'                          <Button size="sm" onClick={() => acceptBookingMutation.mutate(booking.id)} disabled={acceptBookingMutation.isPending}>',
'                            <CheckCircle className="w-4 h-4 mr-2" />',
'                            Accept Job',
'                          </Button>',
'                        )}',
'',
'                        {showPauseButton && (',
'                          <Dialog open={pauseDialogOpen === booking.id} onOpenChange={(open) => { if (open) setPauseDialogOpen(booking.id); else setPauseDialogOpen(null); }}>',
'                            <DialogTrigger asChild>',
'                              <Button variant="outline" size="sm"><PauseCircle className="w-4 h-4 mr-2" />Pause Job</Button>',
'                            </DialogTrigger>',
'                            <DialogContent>',
'                              <DialogHeader><DialogTitle>Pause Job</DialogTitle><DialogDescription>Why are you pausing this job?</DialogDescription></DialogHeader>',
'                              <Textarea placeholder="Reason for pausing..." value={pauseReason} onChange={(e) => setPauseReason(e.target.value)} />',
'                              <DialogFooter>',
'                                <Button variant="outline" onClick={() => setPauseDialogOpen(null)}>Cancel</Button>',
'                                <Button onClick={() => pauseBookingMutation.mutate({ bookingId: booking.id, reason: pauseReason })} disabled={pauseBookingMutation.isPending}>Confirm Pause</Button>',
'                              </DialogFooter>',
'                            </DialogContent>',
'                          </Dialog>',
'                        )}',
'',
'                        {showCompleteButton && (',
'                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { if(confirm("Mark this job as finished?")) { apiRequest("POST", "/api/bookings/" + booking.id + "/complete", {}).then(() => { queryClient.invalidateQueries({ queryKey: ["/api/bookings"] }); refetch(); toast({ title: "Job Completed!" }); }); } }}>',
'                            <CheckCircle className="w-4 h-4 mr-2" />',
'                            Job Finished',
'                          </Button>',
'                        )}',
'',
'                        {canReview && (',
'                          <Dialog open={reviewDialogOpen === booking.id} onOpenChange={(open) => { if (open) setReviewDialogOpen(booking.id); else setReviewDialogOpen(null); }}>',
'                            <DialogTrigger asChild>',
'                              <Button variant="outline" size="sm"><Star className="w-4 h-4 mr-2" />Leave Review</Button>',
'                            </DialogTrigger>',
'                            <DialogContent>',
'                              <DialogHeader><DialogTitle>Leave a Review</DialogTitle><DialogDescription>How was your experience?</DialogDescription></DialogHeader>',
'                              <div className="space-y-4 py-4">',
'                                <div className="flex gap-1">',
'                                  {[1,2,3,4,5].map((star) => (',
'                                    <button key={star} type="button" onClick={() => setReviewRating(star)}>',
'                                      <Star className={"w-6 h-6 " + (star <= reviewRating ? "text-amber-500 fill-amber-500" : "text-muted-foreground")} />',
'                                    </button>',
'                                  ))}',
'                                </div>',
'                                <Textarea placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />',
'                              </div>',
'                              <DialogFooter>',
'                                <Button variant="outline" onClick={() => setReviewDialogOpen(null)}>Cancel</Button>',
'                                <Button onClick={() => submitReviewMutation.mutate({ bookingId: booking.id, rating: reviewRating, comment: reviewComment })} disabled={submitReviewMutation.isPending}>Submit Review</Button>',
'                              </DialogFooter>',
'                            </DialogContent>',
'                          </Dialog>',
'                        )}',
    ];
    newButtons.forEach(l => result.push(l));
    inserted = true;
  }
}
fs.writeFileSync('client/src/pages/Bookings.tsx', result.join('\n'));
console.log('Paso 2b listo');
