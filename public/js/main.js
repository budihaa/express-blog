$(document).ready(function(){
	// Delete article ajax
	$('.delete-article	').on('click', function(e){
		$target = $(e.target);
		const id = $target.attr('data-id');
		let hapus = confirm('Are you sure to delete this story?');

		if(hapus == true) {
				$.ajax({
					method: "DELETE",
					url: "/article/delete/" + id,
					success: function(data){
						window.location.href = "/";
					},
					error: function(err){
						console.log(err);
					}
				});
		}
	});

});
